class Template {
  constructor(displayName, filename, inputs) {
    this.displayName = displayName;
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
      result = result.replaceAll(`$\{${i}\}`, values[i]);
    }
    return result;
  }
}

// TODO: Maybe slurp these up automatically from the templates folder. If so,
//       how do we set default values in a nice way? And it is not possible
//       to get all files in a folder from the templates folder from the frontend,
//       so need to have some kind of config file. Or a "compilation" step...
const templates = {
  deployment: new Template("Deployment", "deployment.yaml", {
    name: "my-app",
    image: "nginx",
    port: "8080",
  }),
  service: new Template("Service", "service.yaml", {
    name: "my-service",
    pod_selector: "my-app",
    port_name: "http",
    port: "8080",
    target_port: "http",
  }),
  config_map: new Template("ConfigMap", "config-map.yaml", {
    name: "my-config-map",
    key: "debug",
    value: "true",
  }),
  html: new Template("HTML", "index.html", {}),
  kustomization: new Template("Kustomization", "kustomization.yaml", {}),
  service_monitor: new Template("ServiceMonitor", "service-monitor.yaml", {
    name: "my-service-monitor",
    port: "http",
    service_selector: "my-service",
    namespace: "my-namespace",
  }),
  cilium_network_policy: new Template(
    "Cilium Network Policy",
    "cilium-network-policy.yaml",
    {},
  ),
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
  let innerHTML = "";
  for (const [key, value] of Object.entries(template.inputs)) {
    innerHTML += `<label for="${key}">${key}: </label>\n`;
    innerHTML += `<input type="text" id="${key}" name="${key}" value="${value}" />\n`;
  }
  inputsDiv.innerHTML = innerHTML;
  refreshTemplate();
}

function initializeSelector() {
  let innerHTML = "";
  for (let [id, template] of Object.entries(templates)) {
    innerHTML += `<option value="${id}">${template.displayName}</option>\n`;
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

initializeSelector();
initializeTemplate();
