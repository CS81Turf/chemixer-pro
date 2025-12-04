async function getMixes() {
  try {
    let response = await fetch("/api/mixes");

    if (!response.ok) {
      throw new Error("Failed to load mixes");
    }

    let mixes = await response.json();
    console.log("Mixes: ", mixes);

    let html = createMixTable(mixes);
    document.getElementById("past-mix-table").innerHTML = html;
  } catch (err) {
    console.error("Error loading mixes.");
  }
}

getMixes();

//Creating table for Saved Mixes
function createMixTable(mixes) {
  let totalSqFt = 0;
  let totalWaterVol = 0;
  const chemicalTotals = {};

  let rows = mixes
    .map((mix, idx) => {
      totalSqFt += mix.areaSize;
      totalWaterVol += mix.waterVolume;

      mix.results.forEach((r) => {
        if (!chemicalTotals[r.chemical]) {
          chemicalTotals[r.chemical] = 0;
        }
        chemicalTotals[r.chemical] += r.totalAmount;
      });

      let chemicals = mix.results
        .map((r) => `${r.chemical}: ${r.totalAmount} oz`)
        .join("<br>");

      return `
    <tr>
    <td>${idx + 1}</td>
    <td>${mix.savedAt}</td>
    <td>${mix.treatment}</td>
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
      <td colspan="3"><strong><big>TOTALS: </big></strong></td>
      <td><strong>${totalSqFt} sq ft </strong></td>
      <td><strong>${totalWaterVol} gal</strong></td>
      <td><strong>${chemicalTotalsHtml}</strong></td>
    </tr>
  `;

  return `
  <div class="past-mix-results">
  <table class="results-table">
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
