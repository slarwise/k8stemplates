const templateSelect = document.getElementById("template-select");
const inputsDiv = document.getElementById("inputs");
const resultCode = document.getElementById("result");
const copyButton = document.getElementById("copy");

let template = "";

const deployment = {
  inputs: [
    { id: "name", default: "my-app" },
    { id: "image", default: "nginx" },
    { id: "port", default: "8080" },
  ],
  template: (inputs) => {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${inputs.name}
  labels:
    app: ${inputs.name}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${inputs.name}
  template:
    metadata:
      labels:
        app: ${inputs.name}
    spec:
      containers:
        - name: ${inputs.name}
          image: ${inputs.image}
          ports:
            - containerPort: ${inputs.port}
              name: http`;
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
  template: (inputs) => {
    return `apiVersion: v1
kind: Service
metadata:
  name: ${inputs.name}
  labels:
    app: ${inputs.name}
spec:
  selector:
    app: ${inputs.podSelector}
  ports:
    - name: ${inputs.name}
      port: ${inputs.port}
      targetPort: ${inputs.targetPort}`;
  },
};

const templates = {
  deployment: deployment,
  service: service,
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

function refreshTemplate() {
  const templateName = templateSelect.value;
  template = templates[templateName];
  if (template === undefined) {
    console.error(`Got unexpected template \`${templateName}\``);
    return;
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
