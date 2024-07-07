class Template {
  constructor(name, filename, inputs) {
    this.name = name;
    this.filename = filename;
    this.inputs = inputs;
  }

  async initialize() {
    const result = await fetch(`templates/${this.filename}`);
    this.text = await result.text();
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
  const template = templates[templateName];
  let values = {};
  for (const id in template.inputs) {
    values[id] = document.getElementById(id).value;
  }
  const result = template.build(values);
  resultCode.textContent = result;
}

async function initializeTemplate() {
  const templateName = templateSelect.value;
  if (templateName === "placeholder") {
    inputsDiv.innerHTML = "";
    resultCode.textContent = "";
    return;
  }
  const template = templates[templateName];
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
  }
  if (template.text === undefined) {
    await template.initialize();
  }
  let innerHTML = "";
  for (const [key, value] of Object.entries(template.inputs)) {
    innerHTML += `<label for="${key}">${key}: </label>\n`;
    innerHTML += `<input type="text" id="${key}" name="${key}" value="${value}" />\n`;
  }
  inputsDiv.innerHTML = innerHTML;
  refreshTemplate();
}

let templates = {};
const placeholderPattern = /\$\{([^\}]+)\}/g;

async function initialize() {
  let result = await fetch("config.json");
  let config = await result.json();
  for (let template of config) {
    templates[template.name] = new Template(
      template.name,
      template.filename,
      template.inputs,
    );
  }
  initializeSelector();
  await initializeTemplate();
}

function initializeSelector() {
  let options = `<option value="placeholder">---</option>`;
  for (const t in templates) {
    options += `<option value="${t}">${t}</option>\n`;
  }
  templateSelect.innerHTML = options;
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
