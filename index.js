const templateSelect = document.getElementById("template-select");
const inputsDiv = document.getElementById("inputs");
const resultCode = document.getElementById("result");
const copyButton = document.getElementById("copy");

let template;
const cachedFiles = {};

function replaceAll(mappings, text) {
  let result = text.slice();
  for (const [placeholder, replacement] of Object.entries(mappings)) {
    result = result.replaceAll(`$${placeholder}`, replacement);
  }
  return result;
}

const deployment = {
  inputs: [
    { id: "name", default: "my-app" },
    { id: "image", default: "nginx" },
    { id: "port", default: "8080" },
  ],
  file: "deployment.yaml",
  template: (inputs) => {
    const result = replaceAll(
      {
        NAME: inputs.name,
        APP: inputs.name,
        IMAGE: inputs.image,
        PORT: inputs.port,
      },
      cachedFiles[template.file],
    );
    return result;
  },
};

const service = {
  inputs: [
    { id: "name", default: "my-service" },
    { id: "podSelector", default: "my-app" },
    { id: "portName", default: "http" },
    { id: "port", default: "8080" },
    { id: "targetPort", default: "http" },
  ],
  file: "service.yaml",
  template: (inputs) => {
    const result = replaceAll(
      {
        NAME: inputs.name,
        POD_SELECTOR: inputs.podSelector,
        PORT_NAME: inputs.portName,
        PORT: inputs.port,
        TARGET_PORT: inputs.targetPort,
      },
      cachedFiles[template.file],
    );
    return result;
  },
};

const templates = {
  deployment,
  service,
};

function refreshResult() {
  const inputIds = template.inputs.map((input) => input.id);
  let inputs = {};
  for (const id of inputIds) {
    inputs[id] = document.getElementById(id).value;
  }
  const result = template.template(inputs);
  resultCode.textContent = result;
}

async function refreshTemplate() {
  const templateName = templateSelect.value;
  template = templates[templateName];
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
  }
  if (!(template.file in cachedFiles)) {
    const value = await fetch(`templates/${template.file}`);
    const text = await value.text();
    cachedFiles[template.file] = text;
  }
  let inputsHtml = "";
  for (const input of template.inputs) {
    inputsHtml += `<label for="${input.id}">${input.id}: </label>\n`;
    inputsHtml += `<input type="text" id="${input.id}" name="${input.id}" value="${input.default}" />\n`;
  }
  inputsDiv.innerHTML = inputsHtml;
  refreshResult();
}

templateSelect.onchange = refreshTemplate;

copyButton.onclick = () => {
  const result = resultCode.textContent;
  navigator.clipboard.writeText(result);
};

document.addEventListener("input", refreshResult);
refreshTemplate();
