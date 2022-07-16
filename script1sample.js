window.onload = () => {
  const oldInputValues = new Map();
  document.querySelectorAll("input").forEach((inputElement) => {
    inputElement.addEventListener("keyup", () => {
      if (inputElement.value != oldInputValues.get(inputElement)) {
        const resultElement = document.getElementById("result");
        resultElement.classList.add("d-none");
        oldInputValues.set(inputElement,inputElement.value);
      }

      inputElement.parentNode.classList.add('was-validated');
    });

  });

};

function validateTheta0() {
  const theta0 = document.getElementById("theta0");
  const theta0Value = Number(theta0.value);
  const thetaValue = Number(document.getElementById("theta").value)
  if (theta0Value >= thetaValue) {
    theta0.setCustomValidity("Error!");
  } else {
    theta0.setCustomValidity("");
  }
}

function calculate(event) {
  const formElement = document.getElementById("form");
  formElement.classList.add('was-validated');

  if (formElement.checkValidity()) {
    const result = computeOneSampleN(
      Number(document.getElementById("alpha").value),
      Number(document.getElementById("assurance").value),
      Number(document.getElementById("theta").value),
      Number(document.getElementById("theta0").value),
      Number(document.getElementById("size-ratio").value),
      Number(document.getElementById("sd-ratio").value),
    );
    const resultElement = document.getElementById("result");
    const dynamicDataElement = document.getElementById("dynamic-data");
    resultElement.classList.remove("d-none");
    dynamicDataElement.innerHTML = "";
    dynamicDataElement.appendChild(document.createTextNode(result));
  }
  event.preventDefault();
}

function computeOneSampleN(alpha,assurance,theta,theta0,sizeRatio,sdRatio) {
  const distribution = gaussian(0, 1);

  const beta = 1-assurance;
  const zalpha = distribution.ppf(1-alpha/2);
  const zbeta = distribution.ppf(1-beta);

  const lgtTheta = Math.log(theta/(1-theta));
  const lgtTheta0 = Math.log(theta0/(1-theta0));

  const eta = distribution.ppf(theta)*Math.sqrt(2);

  const fV = 0.5*Math.pow(distribution.pdf(distribution.ppf(theta)),2)*(Math.pow(eta,2)/(2*Math.pow(1+Math.pow(sdRatio,2),2))*(sizeRatio+1+
             Math.pow(sdRatio,4)*(sizeRatio+1)/sizeRatio)+2*(sizeRatio+1)/(1+Math.pow(sdRatio,2))+
             Math.pow(sdRatio,2)*2*(sizeRatio+1)/(sizeRatio*(1+Math.pow(sdRatio,2))));

  let ntotal = Math.pow(((zbeta+zalpha)/(lgtTheta-lgtTheta0)),2)*fV/(Math.pow(theta,2)*Math.pow(1-theta,2));

  const nDisease = Math.ceil(Math.PI/3*ntotal/(sizeRatio+1));
  const nControl = Math.ceil(Math.PI/3*sizeRatio*ntotal/(sizeRatio+1));
  ntotal = nDisease+nControl;

  return "Require " + ntotal + " participants with " + nDisease + " diseased + " + nControl + " nondiseased";
}
