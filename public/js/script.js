import { calculateMix } from "./math.js";

let PRESETS = null;

async function loadPresets() {
  try {
    const res = await fetch("/api/presets");
    if (!res.ok) throw new Error("Failed loading presets");
    PRESETS = await res.json();
  } catch (err) {
    console.error("loadPresets error:", err);
    throw err;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPresets().catch((err) => console.error("Presets error", err));
});


// Gallons and ounces conversion logic
function formatOunces(totalOz) {
  if (totalOz < 128) {
    return `${totalOz} oz`;
  }

  const gallons = Math.floor(totalOz / 128);
  const ounces = totalOz % 128;

  // Round ounces to whole numbers
  const roundedOunces = Math.round(ounces);

  if (roundedOunces === 0) {
    return `${gallons} gal${gallons > 1 ? "s" : ""}`;
  }

  return `${gallons} gal${gallons > 1 ? "s" : ""} ${roundedOunces} oz`;
}

const calculateButton = document.getElementById("calculate-btn");
const waterVolumeInput = document.getElementById("water-volume");
const sprayRateInput = document.getElementById("spray-rate");
const treatmentSelect = document.getElementById("treatmentSelect");
const resultsDiv = document.querySelector(".results");

// Event listener for calculate button
calculateButton.addEventListener("click", async () => {
  if (!PRESETS) {
    await loadPresets();
  }

  const sprayRate = parseFloat(sprayRateInput.value) || 4; // default to 4
  const waterVolume = parseFloat(waterVolumeInput.value);
  const treatment = treatmentSelect.value;

  try {
    const result = calculateMix(waterVolume, sprayRate, treatment, PRESETS);
    displayResults(result);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
});

// Function to display results
function displayResults(data) {
  const { areaSize, waterVolume, sprayRate, treatment, results } = data;

  let html = `
  <div class="label-card results-card">
    <h3>RESULTS FOR:</h3>
    <p><strong>Treatment:</strong> ${treatment}</p>
    <p><strong>Spray Rate:</strong> ${sprayRate} gal/1,000 sq.ft.</p>
    <p><strong>Area:</strong> ${areaSize.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} sq.ft.</p>
    <p><strong>Water Volume:</strong> ${waterVolume.toFixed(2)} gal</p>
  </div>
    <table class="results-table">
      <tr><th>Chemical</th><th>Rate (oz/1000)</th><th>Total </th></tr>
      ${results
        .map(
          (r) =>
            `<tr><td>${r.chemical}</td><td>${
              r.ratePer1000
            }</td><td><strong>${formatOunces(r.totalAmount)}</strong></td></tr>`
        )
        .join("")}
    </table>
    <button class="saveMixBtn" id="saveMixBtn">Save Mix</button>
  `;

  resultsDiv.innerHTML = html;

  // Add event listener for Save Mix button
  const saveMixBtn = document.getElementById("saveMixBtn");

  saveMixBtn.addEventListener("click", async () => {
    saveMix({ areaSize, waterVolume, sprayRate, treatment, results });
  });
}

// Save mix function
async function saveMix(mixData) {
  try {
    const res = await fetch("/api/mixes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mixData),
    });

    if (!res.ok) {
      throw new Error("Failed to save mix.");
    }

    const saved = await res.json();

    console.log("Mix saved:", saved);
    alert("Mix saved successfully!");
    return saved;
  } catch (err) {
    console.error("Error saving mix:", err);
    alert("Error saving mix.");
  }
}
