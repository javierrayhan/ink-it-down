document.addEventListener("DOMContentLoaded", () => {
    const tabContainer = document.querySelector(".tab-container");
    const addTabButton = document.getElementById("add-tab-button");
    const preview = document.getElementById('md-content');
    const editors = {}; 

    const deleteTabButton = document.getElementById("del-tab-button");
    deleteTabButton.addEventListener("click", deleteActiveTab);

    
    const downloadButton = document.getElementById("download-button");
    downloadButton.addEventListener("click", downloadActiveTab);

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
            editorDiv.style.height = "calc(100vh - 175px)";
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

        // --- Switch tab ---
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

    // --- Delete active tab ---
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

    // --- Download active tab content ---
    function downloadActiveTab() {
        const activeRadio = tabContainer.querySelector("input[name='mytabs']:checked");
        if (!activeRadio) return;

        const tabId = activeRadio.id;
        const editorInstance = editors[tabId];
        if (!editorInstance) return;

        const content = editorInstance.getValue();

        // ✅ Minta user isi nama file
        let filename = prompt("Enter filename:", `${tabId}.md`);
        if (!filename) return; // kalau cancel

        if (!filename.endsWith(".md")) {
            filename += ".md"; // biar extension tetap .md
        }

        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }

});


