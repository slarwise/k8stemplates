const inputsDiv = document.getElementById("inputs");
const resultCode = document.getElementById("result");

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
    console.log(key, val);
    const pattern = new RegExp(`\\$\{${key}\}`, "g");
    result = result.replaceAll(pattern, val);
  }
  console.log(result);
  resultCode.textContent = result;
}

init();
inputsDiv.addEventListener("input", updateResult);
