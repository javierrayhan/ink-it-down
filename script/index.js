 let tabCount = 3; // sudah ada tab 1

    document.getElementById("add-tab-button").addEventListener("click", () => {
        tabCount++;

        const section = document.getElementById("tabs-container");

        // bikin radio
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "tabs";
        input.id = "tab" + tabCount;

        // bikin label
        const label = document.createElement("label");
        label.htmlFor = "tab" + tabCount;
        label.textContent = "Tab " + tabCount;

        // bikin content
        const content = document.createElement("div");
        content.className = "tab-content";
        content.id = "content" + tabCount;

        const textarea = document.createElement("textarea");
        textarea.id = "code-tab" + tabCount;
        textarea.placeholder = "Type or click Section button...";
        content.appendChild(textarea);

        // tambahin ke DOM
        section.appendChild(input);
        section.appendChild(label);
        section.appendChild(content);

        // auto select tab baru
        input.checked = true;
    });
