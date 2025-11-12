console.log("✅ script.js loaded");


import { calculateMix } from "./math.js";

const calculateButton = document.getElementById("calculate-btn");
const areaSizeInput = document.getElementById("area-size");
const waterVolumeInput = document.getElementById("water-volume");
const sprayRateInput = document.getElementById("spray-rate");
const treatmentSelect = document.getElementById("treatmentSelect");
const resultsDiv = document.querySelector(".results");

// Event listener for calculate button
calculateButton.addEventListener("click", () => {
  const sprayRate = parseFloat(sprayRateInput.value) || 4; // default to 4
  const areaSize = parseFloat(areaSizeInput.value);
  const waterVolume = parseFloat(waterVolumeInput.value);
  const treatment = treatmentSelect.value;

  const result = calculateMix({ areaSize, waterVolume, sprayRate, treatment });

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
    <p><strong>Area:</strong> ${areaSize.toFixed(2)} sq.ft.</p>
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