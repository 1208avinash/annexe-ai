$file = "index.html"

$content = Get-Content $file -Raw


$pattern = '(?s)async function handleSendMessage\(\).*?\
        }\s*\
\s*chatSend\.addEventListener'


$replacement = @'
async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    detectLead(text);

    appendMessage(
        renderMarkdown(text),
        'user'
    );

    chatInput.value = '';

    chatHistory.push({
        role: 'user',
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

            const err = await response.json()
                .catch(() => ({}));

            throw new Error(
                err.error || `HTTP ${response.status}`
            );
        }


        removeTyping();


        const botDiv = appendMessage(
            '',
            'bot'
        );


        triggerProcessPulse();


        const data = await response.json();


        const fullText =
            data.reply ||
            "Neural response unavailable.";


        botDiv.innerHTML =
            renderMarkdown(fullText);


        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        chatHistory.push({
            role: 'assistant',
            content: fullText
        });


    } catch (error) {

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

        chatSend.addEventListener
'@


$newContent = [regex]::Replace(
    $content,
    $pattern,
    $replacement
)


Set-Content $file $newContent -Encoding UTF8


Write-Host "ANNEXE AI chatbot fixed successfully"