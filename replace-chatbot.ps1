$file = "index.html"

$content = Get-Content $file -Raw


$start = $content.IndexOf("async function handleSendMessage()")

$end = $content.IndexOf("chatSend.addEventListener", $start)


$newFunction = @'
async function handleSendMessage() {

    const text = chatInput.value.trim();

    if (!text) return;


    detectLead(text);

    appendMessage(renderMarkdown(text), "user");

    chatInput.value = "";


    chatHistory.push({
        role: "user",
        content: text
    });


    showTyping();


    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })

        });


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        removeTyping();


        const botDiv = appendMessage(
            "",
            "bot"
        );


        triggerProcessPulse();


        const data = await response.json();


        const fullText =
            data.reply ||
            "No response generated.";


        botDiv.innerHTML =
            renderMarkdown(fullText);


        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        chatHistory.push({

            role: "assistant",

            content: fullText

        });


    } catch(error) {


        console.error(
            "ANNEXE Chat error:",
            error
        );


        removeTyping();


        appendMessage(
            "Neural connection interrupted — please try again in a moment.",
            "bot"
        );

    }

}

'@


$content = 
$content.Substring(0,$start) +
$newFunction +
$content.Substring($end)


Set-Content $file $content -Encoding UTF8


Write-Host "Chatbot function replaced successfully"