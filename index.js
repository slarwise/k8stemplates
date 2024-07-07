class Template {
  constructor(name, text, inputs) {
    this.name = name;
    this.text = text;
    this.inputs = inputs;
  }

  build(values) {
    let result = this.text.slice();
    for (const i in this.inputs) {
      const placeholderPattern = new RegExp(`\\$\{${i},[^}]*\}`, "g");
      const noPlaceholderPattern = new RegExp(`\\$\{${i}\}`, "g");
      result = result.replaceAll(placeholderPattern, values[i]);
      result = result.replaceAll(noPlaceholderPattern, values[i]);
    }
    return result;
  }
}

function refreshTemplate() {
  const templateName = templateSelect.value;
  const template = templates.find((t) => t.name === templateName);
  let values = {};
  for (const id in template.inputs) {
    values[id] = document.getElementById(id).value;
  }
  const result = template.build(values);
  resultCode.textContent = result;
}

function initializeTemplate() {
  const templateName = templateSelect.value;
  const template = templates.find((t) => t.name === templateName);
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
  }
  let innerHTML = "";
  for (const [key, value] of Object.entries(template.inputs)) {
    innerHTML += `<label for="${key}">${key}: </label>\n`;
    innerHTML += `<input type="text" id="${key}" name="${key}" value="${value}" />\n`;
  }
  inputsDiv.innerHTML = innerHTML;
  refreshTemplate();
}

let templates = [];
const placeholderPattern = /\$\{([^\}]+)\}/g;

async function initialize() {
  if (Object.keys(templates).length === 0) {
    let result = await fetch("templates.txt");
    let availableTemplates = await result.text();
    for (let t of availableTemplates.split("\n")) {
      if (t === "") {
        continue;
      }
      const result = await fetch(`templates/${t}`);
      const text = await result.text();
      const name = t.split(".")[0];
      const matches = text.matchAll(placeholderPattern);
      let inputs = {};
      if (matches) {
        for (const m of matches) {
          const split = m[1].split(",");
          const key = split[0];
          if (key in inputs) {
            continue;
          }
          let placeholder = key;
          if (split.length > 1) {
            placeholder = split[1].trim();
          }
          inputs[key] = placeholder;
        }
      }
      templates.push(new Template(name, text, inputs));
    }
  }
  initializeSelector();
  initializeTemplate();
}

function initializeSelector() {
  let innerHTML = "";
  for (const t of templates) {
    innerHTML += `<option value="${t.name}">${t.name}</option>\n`;
  }
  templateSelect.innerHTML = innerHTML;
}

const inputsDiv = document.getElementById("inputs");
const resultCode = document.getElementById("result");
const templateSelect = document.getElementById("template-select");
const copyButton = document.getElementById("copy");

templateSelect.onchange = initializeTemplate;
inputsDiv.oninput = refreshTemplate;
copyButton.onclick = () => {
  const result = resultCode.textContent;
  navigator.clipboard.writeText(result);
};

initialize();
