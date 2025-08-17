document.addEventListener("DOMContentLoaded", () => {
    const tabContainer = document.querySelector(".tab-container");
    const addTabButton = document.getElementById("add-tab-button");
    const preview = document.getElementById('md-content');
    const editors = {}; // mapping tabId => editor instance

    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.23.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {

        // --- Init editor pertama ---
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

            // init editor baru
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
            preview.innerHTML = ''; // kosongin preview awal tab baru
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
});
