const inputsDiv = document.getElementById("inputs");
const resultCode = document.getElementById("result");
const copyButton = document.getElementById("copy");

const inputElements = inputsDiv.getElementsByTagName("input");

function getUserInput() {
  const inputs = {};
  for (const i of inputElements) {
    inputs[i.id] = i.value;
  }
  return inputs;
}

let template;
function init() {
  template = resultCode.textContent;
  updateResult();
  resultCode.style.visibility = "visible";
}

function updateResult() {
  const inputs = getUserInput();
  let result = template.slice();
  for (const [key, val] of Object.entries(inputs)) {
    const pattern = new RegExp(`\\$\{${key}\}`, "g");
    result = result.replaceAll(pattern, val);
  }
  resultCode.textContent = result;
}

function copyResult() {
  const result = resultCode.textContent.replace(/[ ]+$/, "");
  navigator.clipboard.writeText(result);
}

init();
inputsDiv.addEventListener("input", updateResult);
copyButton.addEventListener("click", copyResult);
