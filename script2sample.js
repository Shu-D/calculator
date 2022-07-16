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

function validateTheta2AndDelta0() {
  const theta2 = document.getElementById("theta2");
  const theta2Value = Number(theta2.value);
  const theta1Value = Number(document.getElementById("theta1").value)
  if (theta2Value <= theta1Value) {
    theta2.setCustomValidity("Error!");
  } else {
    theta2.setCustomValidity("");
  }
  const delta0 = document.getElementById("delta0");
  const delta0Value = Number(delta0.value);
  // To address floating point error
  if (delta0Value >= Number((theta2Value - theta1Value).toFixed(10))) {
    delta0.setCustomValidity("Error!");
  } else {
    delta0.setCustomValidity("");
  }
}

function calculate(event) {
  const formElement = document.getElementById("form");
  formElement.classList.add('was-validated');

  if (formElement.checkValidity()) {
    const result = computeTwoSampleN(
      Number(document.getElementById("alpha").value),
      Number(document.getElementById("assurance").value),
      Number(document.getElementById("theta1").value),
      Number(document.getElementById("theta2").value),
      Number(document.getElementById("delta0").value),
      Number(document.getElementById("rho").value),
      Number(document.getElementById("size-ratio").value),
      Number(document.getElementById("sd-ratio1").value),
      Number(document.getElementById("sd-ratio2").value),
    );
    const resultElement = document.getElementById("result");
    const dynamicDataElement = document.getElementById("dynamic-data");
    resultElement.classList.remove("d-none");
    dynamicDataElement.innerHTML = "";
    dynamicDataElement.appendChild(document.createTextNode(result));
  }
  event.preventDefault();
}

function computeTwoSampleN(alpha,assurance,theta1,theta2,delta0,rho,sizeRatio,sdRatio1,sdRatio2) {
  const distribution = gaussian(0, 1);

  const beta = 1-assurance;
  const zalpha = distribution.ppf(1-alpha/2);
  const zbeta = distribution.ppf(1-beta);

  const thetaNew = (theta2-theta1+1)/2;
  const lgtThetaNew = Math.log(thetaNew/(1-thetaNew));
  const theta0new = (delta0+1)/2;
  const lgtTheta0new = Math.log(theta0new/(1-theta0new));

  const eta1 = distribution.ppf(theta1)*Math.sqrt(2);
  const eta2 = distribution.ppf(theta2)*Math.sqrt(2);

  const fV1 = 0.5*Math.pow(distribution.pdf(distribution.ppf(theta1)),2)*(Math.pow(eta1,2)/(2*Math.pow(1+Math.pow(sdRatio1,2),2))*(sizeRatio+1+
             Math.pow(sdRatio1,4)*(sizeRatio+1)/sizeRatio)+2*(sizeRatio+1)/(1+Math.pow(sdRatio1,2))+
             Math.pow(sdRatio1,2)*2*(sizeRatio+1)/(sizeRatio*(1+Math.pow(sdRatio1,2))));

  const fV2 = 0.5*Math.pow(distribution.pdf(distribution.ppf(theta2)),2)*(Math.pow(eta2,2)/(2*Math.pow(1+Math.pow(sdRatio2,2),2))*(sizeRatio+1+
            Math.pow(sdRatio2,4)*(sizeRatio+1)/sizeRatio)+2*(sizeRatio+1)/(1+Math.pow(sdRatio2,2))+
            Math.pow(sdRatio2,2)*2*(sizeRatio+1)/(sizeRatio*(1+Math.pow(sdRatio2,2))));

  let ntotal = Math.pow((zbeta+zalpha)/(lgtThetaNew-lgtTheta0new),2)*0.25*(fV1+fV2-
             2*rho*Math.sqrt(fV1)*Math.sqrt(fV2))/(Math.pow(thetaNew,2)*Math.pow(1-thetaNew,2));

  const nDisease = Math.ceil(Math.PI/3*ntotal/(sizeRatio+1));
  const nControl = Math.ceil(Math.PI/3*sizeRatio*ntotal/(sizeRatio+1));

  ntotal = nDisease+nControl;

  return "Require " + ntotal + " participants with " + nDisease + " diseased + " + nControl + " nondiseased";
}
