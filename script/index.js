document.addEventListener("DOMContentLoaded", () => {
    const tabContainer = document.querySelector(".tab-container");
    const addTabButton = document.getElementById("add-tab-button");
    const preview = document.getElementById('md-content');
    const editors = []; // nyimpen semua instance editor

    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.23.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {

        // --- Init editor pertama ---
        const editor1 = monaco.editor.create(document.getElementById('editor1'), {
            value: '',
            language: 'markdown',
            theme: 'vs-dark',
            automaticLayout: true
        });
        editors.push(editor1);

        // live preview untuk editor pertama
        editor1.onDidChangeModelContent(() => {
            const md = editor1.getValue();
            preview.innerHTML = md ? window.markdownit().render(md) : '';
        });

        // --- Event untuk tambah tab baru ---
        addTabButton.addEventListener("click", () => {
            let tabCount = tabContainer.querySelectorAll("input[type='radio']").length + 1;

            // bikin radio
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mytabs";
            input.id = `tab${tabCount}`;

            // bikin label
            const label = document.createElement("label");
            label.setAttribute("for", input.id);
            label.textContent = `TAB ${tabCount}`;

            // bikin content
            const div = document.createElement("div");
            div.classList.add("tab");

            // editor container
            const editorDiv = document.createElement("div");
            editorDiv.classList.add("editor");
            editorDiv.id = `editor${tabCount}`;
            editorDiv.style.width = "100%";
            editorDiv.style.height = "calc(100vh - 175px)";
            div.appendChild(editorDiv);

            // append ke DOM
            tabContainer.appendChild(input);
            tabContainer.appendChild(label);
            tabContainer.appendChild(div);

            // init Monaco tapi taruh di editor yang visible aja
            const editor = monaco.editor.create(editorDiv, {
                value: '',
                language: 'markdown',
                theme: 'vs-dark',
                automaticLayout: true
            });
            editors.push(editor);

            // live preview
            editor.onDidChangeModelContent(() => {
                const md = editor.getValue();
                preview.innerHTML = md ? window.markdownit().render(md) : '';
            });

            // otomatis pilih tab baru
            input.checked = true;
            editor.layout();
        });

        // --- Event untuk switch tab ---
        tabContainer.addEventListener("change", (e) => {
            if (e.target.type === "radio") {
                const editorDivId = `editor${e.target.id.replace('tab','')}`;
                const editorInstance = editors.find(ed => ed.getDomNode().id === editorDivId);
                if (editorInstance) {
                    editorInstance.layout(); 
                }
            }
        });

    });
});

