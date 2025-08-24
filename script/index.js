let userToken = null;

document.addEventListener("DOMContentLoaded", () => {
    const snippets = {
        section1: "\n# Section 1\nDefault content...\n", // H1 heading
        section2: "\n## Section 2\nLorem ipsum...\n", // H2 heading
        section3: "\n- List item A\n- List item B\n", // Unordered list
        section4: "\n```js\nconsole.log('Hello World');\n```\n", // Code block
        section5: "\n> Quote block\n", // Blockquote
        section6: "\n### Subsection 6\nMore content...\n", // H3 heading
        section7: "\n1. Ordered item 1\n2. Ordered item 2\n", // Ordered list
        section8: "\n#### Section 8\nCustom text...\n", // H4 heading
        section9: "\n**Bold text** and *italic text*\n", // Text formatting
        section10: "\n---\nHorizontal rule\n", // Horizontal rule
        section11: "\n[Link](https://example.com)\n", // Hyperlink
        section12: "\n![Image](https://picsum.photos/seed/picsum/300/300)\n", // Image
        section13: "\n`Inline code example`\n", // Inline code
        section14: "\n| Column 1 | Column 2 |\n|----------|----------|\n| Row 1    | Data A   |\n| Row 2    | Data B   |\n", // Simple table
        section15: "\n~~Strikethrough text~~\n", // Strikethrough
        section16: "\n### Checklist\n- [ ] Task 1\n- [x] Task 2\n", // Task list / checklist
        section17: "\n- **Details:**\n  - Extra info line 1\n  - Extra info line 2\n" // Details
    };

    // === RUN AI ===
    const runAiBtn = document.getElementById("run-ai");
    const promptBox = document.getElementById("ai-prompt-box");

    // === POPUP FUNCTION ===
    const overlay = document.getElementById("popupOverlay");
    const openBtn = document.getElementById("custom-api");
    const cancelBtn = document.getElementById("popup-cancel");

    // === TAB FUNCTIONALITY ===
    const tabContainer = document.querySelector(".tab-container");
    const addTabButton = document.getElementById("add-tab-button");
    const preview = document.getElementById('md-content');
    const editors = {}; 

    const deleteTabButton = document.getElementById("del-tab-button");
    deleteTabButton.addEventListener("click", deleteActiveTab);
    
    const downloadButton = document.getElementById("download-button");
    downloadButton.addEventListener("click", downloadActiveTab);

    // === MONACO EDITOR ===
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.23.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {

        const editor1 = monaco.editor.create(document.getElementById('editor1'), {
            value: '',
            language: 'markdown',
            theme: 'vs-dark',
            automaticLayout: true
        });
        editors['tab1'] = editor1;

        editor1.onDidChangeModelContent(() => {
            preview.innerHTML = editor1.getValue() ? window.markdownit().render(editor1.getValue()) : '';
        });

        // --- Add new tab ---
        addTabButton.addEventListener("click", () => {

            const emptyMsg = tabContainer.querySelector(".empty-message");
            if (emptyMsg) emptyMsg.remove();

            const tabCount = Object.keys(editors).length + 1;
            const tabId = `tab${tabCount}`;

            // radio & label
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mytabs";
            input.id = tabId;

            const label = document.createElement("label");
            label.setAttribute("for", tabId);
            label.textContent = `TAB ${tabCount}`;

            // tab content
            const div = document.createElement("div");
            div.classList.add("tab");

            const editorDiv = document.createElement("div");
            editorDiv.classList.add("editor");
            editorDiv.id = `editor${tabCount}`;
            editorDiv.style.width = "100%";
            editorDiv.style.height = "calc(100vh - 310px)";
            div.appendChild(editorDiv);

            tabContainer.appendChild(input);
            tabContainer.appendChild(label);
            tabContainer.appendChild(div);

            // new editor init
            const editor = monaco.editor.create(editorDiv, {
                value: '',
                language: 'markdown',
                theme: 'vs-dark',
                automaticLayout: true
            });
            editors[tabId] = editor;

            editor.onDidChangeModelContent(() => {
                if (input.checked) {
                    preview.innerHTML = editor.getValue() ? window.markdownit().render(editor.getValue()) : '';
                }
            });

            input.checked = true;
            editor.layout();
            preview.innerHTML = ''; 
        });

        // === SWITCH TAB ===
        tabContainer.addEventListener("change", (e) => {
            if (e.target.type === "radio") {
                const editorInstance = editors[e.target.id];
                if (editorInstance) {
                    editorInstance.layout();
                    preview.innerHTML = editorInstance.getValue() ? window.markdownit().render(editorInstance.getValue()) : '';
                }
            }
        });
    });

    document.getElementById("popup-confirm").addEventListener("click", () => {
        const input = document.querySelector(".api-input").value.trim();
        if (input) {
            userToken = input;
            closePopup();
            showToast("API key saved!");
        } else {
            userToken = null;
            closePopup();
            showToast("No API key entered, will use default API.");       
        }
    });

    // === RUN AI ===
    runAiBtn.addEventListener("click", async () => {
        showToast("Sending prompt to AI...");

        const prompt = promptBox.value.trim();
        if (!prompt) {
            showToast("Prompt cannot be empty!");
            return;
        }

        // Cari tab aktif
        const activeRadio = tabContainer.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) {
            showToast("No active tab selected!");
            return;
        }

        const tabId = activeRadio.id;
        const editorInstance = editors[tabId];

        if (!editorInstance) {
            return showToast(`Editor not found for tab: ${tabId}`);
        }

        try {      
            let response;

            if (userToken) {
                // Kalau ada API key → pakai API custom
                response = await fetch("http://127.0.0.1:5000/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt,
                        api_token: userToken
                    })
                });
                console.log("Sending request from custom API...");
            } else {
                // Kalau nggak ada API key → fallback ke backend lokal
                response = await fetch("http://127.0.0.1:5000/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt })
                });
                console.log("Sending request from local API...");
            }

            // console.log("Response status:", response.status);
            // console.log("Response text:", await response.text());

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            const aiResponse = data.result || "⚠️ No response from AI";
            console.log("Raw data from API:", data);
            // Tulis ke Monaco Editor aktif
            editorInstance.executeEdits("ai-insert", [
                {
                    range: editorInstance.getSelection(),
                    text: `\n${aiResponse}\n`,
                    forceMoveMarkers: true
                }
            ]);

            showToast("AI response inserted!");
        } catch (err) {
            console.error(err);
            showToast("Error fetching AI response!");
        }
    });


    // === POPUP FUNCTION ===
    function openPopup() {
        overlay.classList.add("active");
    }

    function closePopup(e) {
        if (!e || e.target === overlay || e.target.classList.contains("cancel")) {
            overlay.classList.remove("active");
        }
    }

    // === DELETE ACTIVE TAB ===
    function deleteActiveTab() {
        const activeRadio = tabContainer.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) return; // Innactive tab

        const tabId = activeRadio.id;       // ex: tab2
        const label = tabContainer.querySelector(`label[for='${tabId}']`);
        const div = tabContainer.querySelector(`#${tabId} ~ .tab`); // atake div after input

        // destroy monaco editor instance 
        if (editors[tabId]) {
            editors[tabId].dispose();
            delete editors[tabId];
        }

        // remove elements
        activeRadio.remove();
        if (label) label.remove();
        if (div) div.remove();

        // fallback: activated tab 1 if exists
        const remainingRadios = tabContainer.querySelectorAll("input[name='mytabs']");
        if (remainingRadios.length > 0) {
            // Index search
            const radiosArray = Array.from(remainingRadios);
            let prevRadio = null;

            for (let i = 0; i < radiosArray.length; i++) {
                if (radiosArray[i].id > tabId) {
                    prevRadio = radiosArray[i - 1] || radiosArray[0];
                    break;
                }
            }

            if (!prevRadio) prevRadio = radiosArray[radiosArray.length - 1];

            prevRadio.checked = true;
            const editorInstance = editors[prevRadio.id];
            if (editorInstance) {
                preview.innerHTML = editorInstance.getValue()
                    ? window.markdownit().render(editorInstance.getValue())
                    : '';
            } else {
                preview.innerHTML = "";
            }

            // Delete message
            const emptyMsg = tabContainer.querySelector(".empty-message");
            if (emptyMsg) emptyMsg.remove();

        } else {
            // If there is no container
            preview.innerHTML = "";
            if (!tabContainer.querySelector(".empty-message")) {
                const msg = document.createElement("p");
                msg.className = "empty-message";
                msg.style.color = "gray";
                msg.style.fontStyle = "italic";
                msg.style.padding = "8px";
                msg.textContent = "Click New Tab button to add a new tab";
                tabContainer.appendChild(msg);
            }
        }

    }

    // === DOWNLOAD ACTIVE TAB CONTENT ===
    function downloadActiveTab() {
        const activeRadio = tabContainer.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) {
            showToast("No active tab selected!");
            return;
        }
        const tabId = activeRadio.id;
        const editorInstance = editors[tabId];
        if (!editorInstance) return;

        const content = editorInstance.getValue();

        let filename = prompt("Enter filename:", `${tabId}.md`);
        if (!filename) return;

        if (!filename.endsWith(".md")) {
            filename += ".md"; 
        }

        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        showToast(`${filename} downloaded successfully!`);
    }

    // === INSERT SNIPPET TO ACTIVE TAB ===
    function insertToActiveTab(snippetKey) {
        const activeRadio = document.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) {
            showToast("No active tab selected!");
            return;
        }

        const editorInstance = editors[activeRadio.id];
        if (editorInstance) {
            const snippet = snippets[snippetKey] || "";
            const selection = editorInstance.getSelection();
            const id = { major: 1, minor: 1 };
            const op = {
                identifier: id,
                range: selection,
                text: snippet,
                forceMoveMarkers: true
            };
            editorInstance.executeEdits("insert-snippet", [op]);
        }
    }

    // === Copy active tab content ===
    function copyActiveTabContent() {
        const activeRadio = tabContainer.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) {
            // alert("No active tab selected!");
            showToast("No active tab selected!");
            return;
        }

        const tabId = activeRadio.id;
        const editorInstance = editors[tabId];
        if (!editorInstance) {
            alert("No editor instance found for this tab!");
            return;
        }

        const content = editorInstance.getValue();

        navigator.clipboard.writeText(content).then(() => {
            showToast("Copied!");
        }).catch(() => {
            showToast("Failed to copy!");
        });

    }

    // === SHOW TOAST ===
    function showToast(message, duration = 3000) {
        toast.textContent = message;

        // reset class
        toast.classList.remove("hide");
        toast.style.visibility = "visible";

        // trigger show
        toast.classList.add("show");

        setTimeout(() => {
            // mulai hide animation
            toast.classList.remove("show");
            toast.classList.add("hide");

            // tunggu transisi selesai sebelum hide sepenuhnya
            toast.addEventListener("transitionend", function handler() {
                if (toast.classList.contains("hide")) {
                    toast.style.visibility = "hidden";
                }
                toast.removeEventListener("transitionend", handler);
            });
        }, duration);
    }

    // SECTION SNIPPET BINDING 
    document.getElementById("section-button1")
        .addEventListener("click", () => insertToActiveTab("section1"));

    document.getElementById("section-button2")
        .addEventListener("click", () => insertToActiveTab("section2"));

    document.getElementById("section-button3")
        .addEventListener("click", () => insertToActiveTab("section3"));

    document.getElementById("section-button4")
        .addEventListener("click", () => insertToActiveTab("section4"));

    document.getElementById("section-button5")
        .addEventListener("click", () => insertToActiveTab("section5"));

    document.getElementById("section-button6")
        .addEventListener("click", () => insertToActiveTab("section6"));

    document.getElementById("section-button7")
        .addEventListener("click", () => insertToActiveTab("section7"));

    document.getElementById("section-button8")
        .addEventListener("click", () => insertToActiveTab("section8"));

    document.getElementById("section-button9")
        .addEventListener("click", () => insertToActiveTab("section9"));

    document.getElementById("section-button10")
        .addEventListener("click", () => insertToActiveTab("section10"));

    document.getElementById("section-button11")
        .addEventListener("click", () => insertToActiveTab("section11"));

    document.getElementById("section-button12")
        .addEventListener("click", () => insertToActiveTab("section12"));

    document.getElementById("section-button13")
        .addEventListener("click", () => insertToActiveTab("section13"));

    document.getElementById("section-button14")
        .addEventListener("click", () => insertToActiveTab("section14"));

    document.getElementById("section-button15")
        .addEventListener("click", () => insertToActiveTab("section15"));

    document.getElementById("section-button16")
        .addEventListener("click", () => insertToActiveTab("section16"));

    document.getElementById("section-button17")
        .addEventListener("click", () => insertToActiveTab("section17"));

    // COPY BUTTON
    document.getElementById("copy-button")
        .addEventListener("click", copyActiveTabContent);

    // POPUP EVENT BINDING
    if (openBtn) openBtn.addEventListener("click", openPopup);
    if (cancelBtn) cancelBtn.addEventListener("click", closePopup);
    if (overlay) overlay.addEventListener("click", closePopup);

    // ESC key close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            overlay.classList.remove("active");
        }
    });
});



