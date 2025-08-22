const promptBox = document.getElementById("promptBox");
const sendBtn = document.getElementById("sendBtn");
const resultBox = document.getElementById("resultBox");

sendBtn.addEventListener("click", async () => {
    const prompt = promptBox.value;
    resultBox.textContent = "Loading...";
    if (!prompt.trim()) {
        resultBox.textContent = "Please enter a prompt!";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        console.log("HTTP status:", res.status);
        console.log("HTTP ok?", res.ok);

        // parse JSON langsung
        const data = await res.json();
        console.log("Parsed data:", data);

        if (data.result && data.result.trim()) {
            resultBox.textContent = data.result;
        } else if (data.error) {
            resultBox.textContent = "Backend error: " + data.error;
        } else {
            resultBox.textContent = "Backend returned empty result";
        }

    } catch (err) {
        console.error("Fetch error:", err);
        resultBox.textContent = "Fetch error: " + err;
    }
});
