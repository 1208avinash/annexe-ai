export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { message } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages:[
            {
              role:"system",
              content:
              "You are ANNEXE AI enterprise automation assistant."
            },
            {
              role:"user",
              content:message
            }
          ]
        })
      }
    );


    const data = await response.json();


    return res.status(200).json({
      reply:
      data.choices?.[0]?.message?.content ||
      "No response generated."
    });


  } catch(error){

    console.error(error);

    return res.status(500).json({
      error:"AI connection failed"
    });

  }
}