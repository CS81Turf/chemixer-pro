let allMixes = []; // Store all mixes globally

async function getMixes() {
  try {
    let response = await fetch("/api/mixes");

    if (!response.ok) {
      throw new Error("Failed to load mixes");
    }

    allMixes = await response.json();
    console.log("Mixes: ", allMixes);

    displayMixes(allMixes); // Show all by default
  } catch (err) {
    console.error("Error loading mixes.");
  }
}

// Display mixes in the table
function displayMixes(mixesToShow) {
  let html = createMixTable(mixesToShow);
  document.getElementById("past-mix-table").innerHTML = html;
}

// Apply all filters
function applyFilters() {
  const treatment = document.getElementById("treatmentFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let filtered = [...allMixes];

  // Filter by treatment
  if (treatment !== "") {
    filtered = filtered.filter((mix) => mix.treatment === treatment);
  }

  // Filter by date range
  filtered = filtered.filter((mix) => {
    const mixDate = new Date(mix.savedAt);

    if (startDate && mixDate < new Date(startDate)) return false;
    if (endDate && mixDate > new Date(endDate)) return false;

    return true;
  });

  displayMixes(filtered);
}

// Clear all filters
function clearFilters() {
  document.getElementById("treatmentFilter").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  displayMixes(allMixes);
}

// Setup event listeners when page loads
document.addEventListener("DOMContentLoaded", async () => {
  await getMixes();

  const treatmentFilter = document.getElementById("treatmentFilter");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");

  if (treatmentFilter) treatmentFilter.addEventListener("change", applyFilters);
  if (startDate) startDate.addEventListener("change", applyFilters);
  if (endDate) endDate.addEventListener("change", applyFilters);
  if (applyFilterBtn) applyFilterBtn.addEventListener("click", applyFilters);
  if (clearFilterBtn) clearFilterBtn.addEventListener("click", clearFilters);
});

//Creating table for Saved Mixes
function createMixTable(mixes) {
  if (!Array.isArray(mixes) || mixes.length === 0) {
    return "<p>No mixes found.</p>";
  }

  let totalSqFt = 0;
  let totalWaterVol = 0;
  const chemicalTotals = {};

  let rows = mixes
    .map((mix, idx) => {
      const area = Number(mix.areaSize) || 0;
      const water = Number(mix.waterVolume) || 0;
      const results = Array.isArray(mix.results) ? mix.results : [];

      totalSqFt += mix.areaSize;
      totalWaterVol += mix.waterVolume;

      let chemicals = results.map((r) => {
        const chem = r.chemical || "Unknown";
        const amount = Number(r.totalAmount) || 0;

        if (!chemicalTotals[chem]) chemicalTotals[chem] = 0;
        chemicalTotals[chem] += amount;

        return `${chem}: ${amount} oz`;
      }).join("<br>");

      return ` 
    <tr>
    <td>${idx + 1}</td>
    <td>${mix.savedAt || ""}</td>
    <td>${mix.treatment || ""}</td>
    <td>${mix.areaSize}</td>
    <td>${mix.waterVolume}</td>
    <td>${chemicals}</td>
    </tr>`;
    })
    .join("");

  // Build totals footer row
  const chemicalTotalsHtml = Object.entries(chemicalTotals)
    .map(([name, amount]) => `${name}: ${amount} oz`)
    .join("<br>");

  const totalsRow = `
    <tr class="totals-row">
    <td colspan="6">
      <div><strong>TOTALS</strong></div>
      <div><strong>Total Sq.Ft.: ${totalSqFt.toLocaleString("en-us")}</strong></div>
      <div><strong>Water Used: ${totalWaterVol.toLocaleString("en-us")} gal</strong></div>
      <div><strong>Chemicals:</strong></div>
      ${chemicalTotalsHtml}
    </td>
  </tr>
`;

  return `
  <div class="past-mix-results">
  <table class="mix-results-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Date/Time</th>
          <th>Treatment</th>
          <th>Sq. Ft.</th>
          <th>Water Vol.</th>
          <th>Chemicals Used</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${totalsRow}
      </tbody>
    </table>
    </div>
    `;
}
