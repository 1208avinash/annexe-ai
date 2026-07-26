export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const {

      clientName,
      companyName,
      industry,
      challenge,
      solution,
      blueprint

    } = req.body || {};



    if (!clientName && !companyName) {

      return res.status(400).json({

        error:
        "Client information required"

      });

    }



    // Generate project ID

    const projectId =
      "ANNEXE-" + Date.now();



    /*
      TECHNOLOGY INTELLIGENCE AGENT CONNECTION

      Before architecture begins,
      ANNEXE selects recommended technology stack.

    */


    let technologyRecommendation = null;


    try {


      const technologyResponse =
      await fetch(
        "http://localhost:3000/api/agents/technology/intelligence",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            industry,

            solution,

            requirements:[
              challenge,
              blueprint
            ]

          })

        }
      );


      const technologyData =
      await technologyResponse.json();


      technologyRecommendation =
      technologyData.recommendation || null;


    }
    catch(error){


      console.error(
        "TECHNOLOGY AGENT FAILED:",
        error
      );


    }




    const project = {


      projectId,


      clientName:
      clientName || "Unknown",


      companyName:
      companyName || "Unknown",


      industry:
      industry || "Not defined",


      challenge:
      challenge || "Not defined",


      solution:
      solution || "Not defined",


      blueprint:
      blueprint || {},



      technology:
      technologyRecommendation,



      status:
      "architecture_pending",



      nextAgent:
      "architect_agent",



      createdAt:
      new Date().toISOString()


    };



    console.log(
      "ANNEXE PROJECT CREATED:",
      project
    );



    return res.status(200).json({

      success:true,

      message:
      "ANNEXE project created",


      project

    });


  }


  catch(error){


    console.error(
      "PROJECT ENGINE ERROR:",
      error
    );


    return res.status(500).json({

      error:
      "Project creation failed"

    });

  }


}