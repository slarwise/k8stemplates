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
    for (const i in this.inputs) {
      result = result.replaceAll(`$\{${i}\}`, values[i]);
    }
    return result;
  }
}

const templates = {
  deployment: new Template("deployment.yaml", {
    name: "my-app",
    image: "nginx",
    port: "8080",
  }),
  service: new Template("service.yaml", {
    name: "my-service",
    pod_selector: "my-app",
    port_name: "http",
    port: "8080",
    target_port: "http",
  }),
  config_map: new Template("config-map.yaml", {
    name: "my-config-map",
    key: "debug",
    value: "true",
  }),
  html: new Template("index.html", {}),
  kustomization: new Template("kustomization.yaml", {}),
  service_monitor: new Template("service-monitor.yaml", {
    name: "my-service-monitor",
    port: "http",
    service_selector: "my-service",
    namespace: "my-namespace",
  }),
  cilium_network_policy: new Template("cilium-network-policy.yaml", {}),
};

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
  const template = templates[templateName];
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
  }
  if (template.text === undefined) {
    await template.initialize();
  }
  let inputsHtml = "";
  for (const i in template.inputs) {
    inputsHtml += `<label for="${i}">${i}: </label>\n`;
    inputsHtml += `<input type="text" id="${i}" name="${i}" value="${i}" />\n`;
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
