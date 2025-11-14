console.log("✅ script.js loaded");


import { calculateMix } from "./math.js";

const calculateButton = document.getElementById("calculate-btn");
const waterVolumeInput = document.getElementById("water-volume");
const sprayRateInput = document.getElementById("spray-rate");
const treatmentSelect = document.getElementById("treatmentSelect");
const resultsDiv = document.querySelector(".results");

// Event listener for calculate button
calculateButton.addEventListener("click", () => {
  const sprayRate = parseFloat(sprayRateInput.value) || 4; // default to 4
  const waterVolume = parseFloat(waterVolumeInput.value);
  const treatment = treatmentSelect.value;

  const result = calculateMix({ waterVolume, sprayRate, treatment });

if (result.error) {
      resultsDiv.innerHTML = `<p style="color:red">${result.error}</p>`;
    return;
  }
    displayResults(result);
});

// Function to display results
function displayResults(data) {
  const { areaSize, waterVolume, sprayRate, treatment, results } = data;

  let html = `
    <h2>Results:</h2>
    <p><strong>Treatment:</strong> ${treatment}</p>
    <p><strong>Spray Rate:</strong> ${sprayRate} gal/1,000 sq.ft.</p>
    <p><strong>Area:</strong> ${areaSize.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq.ft.</p>
    <p><strong>Water Volume:</strong> ${waterVolume.toFixed(2)} gal</p>
    <table>
      <tr><th>Chemical</th><th>Rate (oz/1000)</th><th>Total (oz)</th></tr>
      ${results
        .map(
          (r) =>
            `<tr><td>${r.chemical}</td><td>${r.ratePer1000}</td><td>${r.totalAmount.toFixed(
              2
            )}</td></tr>`
        )
        .join("")}
    </table>
  `;

  resultsDiv.innerHTML = html;
}

// Display Calculator Modal
  const openBtn = document.getElementById('openCalculator');
  const modal = document.getElementById('calculatorModal');
  const closeBtn = document.querySelector('.close');

  // Open modal when "Calculator" is clicked
  openBtn.addEventListener('click', (e) => {
    modal.style.display = 'block';
  });

  // Close modal when the × button is clicked
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal if user clicks outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

// Calculator Modal functionality

    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.button');

    let currentInput = '0';
    let previousInput = '';
    let operator = '';
    let resultDisplayed = false;

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.textContent;

            if (value === 'AC') {
                currentInput = '0';
                previousInput = '';
                operator = '';
                display.textContent = '0';
                return;
            }

            if (value === '=' && currentInput && previousInput) {
                calculate();
                display.textContent = previousInput;
                resultDisplayed = true;
                return;
            }

            if (resultDisplayed && !isNaN(value)) {
                currentInput = value;
                resultDisplayed = false;
                display.textContent = currentInput;
                return;
            }

            if (value === '.' && currentInput.includes('.')) {
                return;
            }

            if (!isNaN(value) || value === '.') {
                if (currentInput === '0' && value !== '.') {
                    currentInput = value;
                } else {
                    currentInput += value;
                }

                display.textContent = currentInput;
                return;
            }

            if (['+', '-', '*', '/'].includes(value)) {
                if (currentInput && previousInput && operator) {
                    calculate();
                } else {
                    previousInput = currentInput;
                }

                operator = value;
                currentInput = '';
                display.textContent = previousInput + ' ' + operator;
                return;
            }
        });
    });

    function calculate() {
        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            default:
                return;
        }

        previousInput = result.toString();
        currentInput = '';
        operator = '';
    }
;