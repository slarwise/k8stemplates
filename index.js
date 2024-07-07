class Template {
  constructor(filename, inputs) {
    this.inputs = inputs;
    this.filename = filename;
  }

  async initialize() {
    const result = await fetch(`templates/${this.filename}`);
    this.text = await result.text();
  }

  build(values) {
    let result = this.text.slice();
    for (const input of this.inputs) {
      result = result.replaceAll(`$\{${input.id}\}`, values[input.id]);
    }
    return result;
  }
}

const templates = {
  deployment: new Template("deployment.yaml", [
    { id: "name", default: "my-app" },
    { id: "image", default: "nginx" },
    { id: "port", default: "8080" },
  ]),
  service: new Template("service.yaml", [
    { id: "name", default: "my-service" },
    { id: "pod_selector", default: "my-app" },
    { id: "port_name", default: "http" },
    { id: "port", default: "8080" },
    { id: "target_port", default: "http" },
  ]),
  config_map: new Template("config-map.yaml", [
    { id: "name", default: "my-config-map" },
    { id: "key", default: "debug" },
    { id: "value", default: "true" },
  ]),
  html: new Template("index.html", []),
  kustomization: new Template("kustomization.yaml", []),
  service_monitor: new Template("service-monitor.yaml", [
    { id: "name", default: "my-service-monitor" },
    { id: "port", default: "http" },
    { id: "service_selector", default: "my-service" },
    { id: "namespace", default: "my-namespace" },
  ]),
  cilium_network_policy: new Template("cilium-network-policy.yaml", []),
};

function refreshTemplate() {
  const templateName = templateSelect.value;
  const template = templates[templateName];
  const inputIds = template.inputs.map((input) => input.id);
  let values = {};
  for (const id of inputIds) {
    values[id] = document.getElementById(id).value;
  }
  const result = template.build(values);
  resultCode.textContent = result;
}

async function initializeTemplate() {
  const templateName = templateSelect.value;
  const template = templates[templateName];
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
  }
  if (template.text === undefined) {
    await template.initialize();
  }
  let inputsHtml = "";
  for (const input of template.inputs) {
    inputsHtml += `<label for="${input.id}">${input.id}: </label>\n`;
    inputsHtml += `<input type="text" id="${input.id}" name="${input.id}" value="${input.default}" />\n`;
  }
  inputsDiv.innerHTML = inputsHtml;
  refreshTemplate();
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

initializeTemplate();
