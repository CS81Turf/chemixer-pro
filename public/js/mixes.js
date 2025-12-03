async function getMixes() {
  try {
    let response = await fetch("/api/mixes");

    if (!response.ok) {
      throw new Error("Failed to load mixes");
    }

    let mixes = await response.json();
    console.log("Mixes: ", mixes);

    let html = mixTable(mixes);
    document.getElementById("past-mix-table").innerHTML = html;
  } catch (err) {
    console.error("Error loading mixes.");
  }
}

getMixes();

//Creating table for Saved Mixes
function createMixTable(mixes) {
  let rows = mixes.map((mix, idx) => {
    return `
    <tr>
    <td>${idx + 1}</td>
    <td>${mix.savedAt}</td>
    <td>${mix.treatment}</td>
    <td>${mix.areaSize}</td>
    <td>${mix.waterVolume}</td>
    <td>${chemicals}</td>
    </tr>`;
  }).join('');

  return `
  <table class="results-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Treatment</th>
          <th>Spray Rate</th>
          <th>Water Volume</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    `;
}
