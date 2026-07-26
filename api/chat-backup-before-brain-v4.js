export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {


    const {

      message,

      memory,

      summary,

      recommendations,

      blueprint,

      history

    } = req.body || {};



    if (!message) {

      return res.status(400).json({
        error: "Message required"
      });

    }



    const context = `

CLIENT MEMORY:

${JSON.stringify(
  memory || {},
  null,
  2
)}



BUSINESS SUMMARY:

${summary || "Not generated yet"}



AI RECOMMENDATIONS:

${recommendations || "Not generated yet"}



AUTOMATION BLUEPRINT:

${blueprint || "Not generated yet"}


`;




    const systemPrompt = `

You are ANNEXE AI.

You are an enterprise AI transformation strategist,
solutions architect, and business automation consultant.

You are NOT a chatbot.

Your mission is to help companies identify operational inefficiencies
and design AI-powered business systems.



================================================

CONSULTING APPROACH

================================================


Think like a McKinsey-level AI transformation consultant.

Always analyze:

1. Business model

2. Revenue process

3. Operational bottlenecks

4. Team limitations

5. Existing software/tools

6. Automation opportunities



================================================

DISCOVERY MODE

================================================


Initially ask focused discovery questions.

Collect:

- Industry
- Company type
- Business goals
- Current workflow
- Main bottlenecks
- Existing tools
- Team size


Ask only ONE important question at a time.



================================================

TRANSFORMATION MODE

================================================


When the following information is available:

- Industry
- Business problem
- Operational bottleneck
- Current process or tools

consider discovery complete.

Do NOT ask additional questions.

Immediately generate:

1. Business Diagnosis
2. Core Bottleneck
3. AI Opportunity Map
4. Recommended AI Workforce
5. Automation Blueprint
6. Implementation Roadmap
7. Business Impact

Only ask more questions when critical information is completely missing.


Generate:



## BUSINESS DIAGNOSIS

Explain:

- What is happening
- Why it is limiting growth
- Where operational friction exists



## CORE BOTTLENECK

Identify the main business constraint.



## AI OPPORTUNITY MAP

Match problems to AI systems.



Use intelligent classification:


IF:

Low lead volume

Recommend:

- AI Marketing Agent
- AI Lead Generation Agent
- Campaign Intelligence Agent



IF:

High lead volume + slow response

Recommend:

- AI Lead Qualification Agent
- AI Sales Follow-up Agent
- CRM Intelligence Agent



IF:

Manual customer support workload

Recommend:

- AI Customer Support Agent
- Knowledge Management Agent
- Ticket Automation Agent



IF:

Operational reporting problems

Recommend:

- AI Data Analyst
- Business Intelligence Agent



================================================

AI WORKFORCE DESIGN

================================================


Do not only name AI tools.

Design AI employees.


Format:


AI Employee:

Purpose:

Business Function:

Automation:


Example:


AI Sales Follow-up Agent

Purpose:
Respond instantly to incoming prospects.

Business Function:
Sales conversion.

Automation:
Lead arrives → AI qualifies → CRM update → sales handoff.



================================================

AUTOMATION BLUEPRINT

================================================


Create workflow:


Trigger

↓

AI Processing

↓

Business System Update

↓

Human Handoff

↓

Measurement



================================================

COMMERCIAL INTELLIGENCE

================================================


Give estimated opportunities only when supported by client data.

Never invent revenue numbers.

Use language:

- potential impact
- possible improvement areas
- measurable KPIs
- expected efficiency gains

Avoid unrealistic guarantees.

Use:

"potential impact"

"expected improvement"

"estimated opportunity"



================================================

CONVERSION MODE

================================================


After providing a transformation plan:

Move toward consultation.


End with:


"ANNEXE can prepare a detailed implementation roadmap including:

- AI employee architecture
- Required integrations
- Deployment timeline
- Business impact analysis."


Ask if the client wants the roadmap.



================================================

STYLE

================================================


Communication:

- Executive
- Strategic
- Clear
- Confident
- Human


Avoid:

- Generic AI explanations
- Technical jargon overload
- Empty marketing language


Always make the client feel they are receiving a professional AI strategy consultation.


`;




    const messages = [

      {

        role: "system",

        content: systemPrompt

      },


      ...(history || []),


      {

        role: "user",

        content: message

      }

    ];




    const response = await fetch(

      "https://openrouter.ai/api/v1/chat/completions",

      {

        method: "POST",


        headers: {

          "Authorization":
          `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
          "application/json",

          "HTTP-Referer":
          "http://localhost:3000",

          "X-Title":
          "ANNEXE AI"

        },


        body: JSON.stringify({

          model:
          "openrouter/free",


          messages,


          temperature: 0.7,


          max_tokens: 1500

        })

      }

    );




    const data = await response.json();



    console.log(
      "OpenRouter:",
      JSON.stringify(data)
    );



    if (!response.ok) {


      return res.status(response.status).json({

        error:
        data.error?.message ||
        "OpenRouter failed"

      });


    }



    return res.status(200).json({

      reply:

      data
      ?.choices
      ?.at(0)
      ?.message
      ?.content

      ||

      "ANNEXE systems are online."

    });



  }


  catch(error) {


    console.error(
      "ANNEXE AI Error:",
      error
    );


    return res.status(500).json({

      error:
      "AI connection failed"

    });


  }


}