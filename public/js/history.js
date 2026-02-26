let allMixes = [];
let allFertUsage = [];

async function getMixes() {
    try {
        const token = localStorage.getItem("token");

        let response = await fetch("/api/mixes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
      
        if (!response.ok) throw new Error("Failed to load mixes");

        allMixes = await response.json();
        console.log("Mixes: ", allMixes);

        displayMixes(allMixes);
    } catch (err) {
        console.error("Error loading mixes.");
        document.getElementById("past-mix-table").innerHTML = "<p>Error loading mix history.</p>";
    }
}

async function getFertUsage() {
    try {
        const token = localStorage.getItem("token");

        let response = await fetch("/api/fertUsage", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load fertilizer usage history");
        }

        allFertUsage = await response.json();
        console.log("Fertilizer Usage: ", allFertUsage);

        displayFertUsage(allFertUsage);
    } catch (err) {
        console.error("Error loading fertilizer usage history.");
        document.getElementById("fert-usage-table").innerHTML = "<p>Error loading fertilizer usage history.</p>";
    }
}

//Display mixes in the table
function displayMixes(mixesToShow) {
    let html = createMixTable(mixesToShow);
    document.getElementById("past-mix-table").innerHTML = html;
}

// Display fertilizer usage in the table
function displayFertUsage(fertUsageToShow) {
    let html = createFertUsageTable(fertUsageToShow);
    document.getElementById("fert-usage-table").innerHTML = html;}

// Creating table for Saved Mixes
function createMixTable(mixes) {
    if (!Array.isArray(mixes) || mixes.length === 0) {
        return "<p>No mixes found.</p>"
    }

    let totalSqFt = 0;
    let totalWaterVol = 0;
    const chemicalTotals = {};

    let rows = mixes.map((mix, idx) => {
        const area = Number(mix.areaSize) || 0;
        const water = Number(mix.waterVolume) || 0;
        const results = Array.isArray(mix.results) ? mix.results : [];

        totalSqFt += area;
        totalWaterVol += water;

        let chemicals = results.map((r) => {
            const chem = r.chemical || "Unkonwn";
            const amount = Number(r.totalAmount) || 0;

            if (!chemicalTotals[chem]) chemicalTotals[chem] = 0;
            chemicalTotals[chem] += amount;

            return `${chem}: ${amount} oz`;
        }).join("<br>");

        return `
        <tr>
        <td>${new Date(mix.savedAt).toLocaleString()}</td>
        <td>${mix.treatment || ""}</td>
        <td>${mix.areaSize}</td>
        <td>${mix.waterVolume}</td>
        <td>${chemicals}</td>
        <td>${mix.savedBy || "Unknown"}</td>
        </tr>`;
    }).join("");

    //Build totals footer row
    const chemcicalTotalsHtml = Object.entries(chemicalTotals).map(([name, amount]) => {
        const gallons = amount / 128;
        return `${name}: ${amount.toFixed(2)} oz (${gallons.toFixed(2)} gal)`
    }).join("<br>");

    const totalsRow = `
    <tr class="totals-row">
    <td colspan="6">
       <div><strong>TOTAL SQ. FT.: ${totalSqFt.toLocaleString("en-us")}</strong></div>
       <div><strong>TOTAL WATER VOL.: ${totalWaterVol.toLocaleString("en-us")} gal</strong></div>
       <div><strong>WATER USED: ${totalWaterVol.toLocaleString("en-us")}</strong></div>
       <div><strong>Chemicals:</strong></div>
       ${chemcicalTotalsHtml}
    </td>
    </tr>`;

    return `
    <div class="past-mix-results">
    <table class="mix-results-table">
         <thead>
         <tr>
         <th>Date/Time</th>
         <th>Treatment</th>
         <th>Sq. Ft.</th>
         <th>Water Volume</th>
         <th>Chemicals Used</th>
         <th>Saved By</th>
         </tr>
         </thead>
         <tbody>
            ${rows}
            ${totalsRow}
         </tbody>
    </table>
    </div>`;
}
 
// Creating table for Fertilizer Usage
function createFertUsageTable(fertUsage) {
    if (!Array.isArray(fertUsage) || fertUsage.length === 0) {
        return "<p>No fertilizer usage found</p>"
    }

    let totalBags = 0;
    const fertilizerTotals = {};

    let rows = fertUsage.map((entry) => {
        const bags = Number(entry.bagsUsed) || 0;
        const type = entry.fertilizerType || "Unknown";

        totalBags += bags;

        if (!fertilizerTotals[type]) fertilizerTotals[type] = 0;
        fertilizerTotals[type] += bags;

        return `
    <tr>
    <td>${new Date(entry.date).toLocaleString()}</td>
    <td>${type}</td>
    <td>${bags}</td>
    <td>${entry.userName || "Unknown"}</td>
    </tr>`
    }).join("");

    // Build totals footer row
    const fertilizerTotalsHtml = Object.entries(fertilizerTotals).map(([type, bags]) => {
        return `${type}: ${bags} bags`;
    }).join("<br>");

    const totalsRow = `
    <tr class="totals-row">
    <td colspan="6">
       <div><strong>TOTALS</strong></div>
       <div><strong>Total Bags Used: ${totalBags}</strong></div>
       <div><strong>By Type:</strong></div>
       ${fertilizerTotalsHtml}
    </td>
    </tr>`;

    return `
    <div class="past-mix-results">
    <table class="mix-results-table">
    <thead>
    <tr>
    <th>Date/Time</th>
    <th>Fertilizer</th>
    <th>Bags Used</th>
    <th>Saved By</th>
    </tr>
    </thead>
    <tbody>
        ${rows}
        ${totalsRow}
    </tbody>
    </table>
    </div>`;
}

// Load both on page startup
document.addEventListener("DOMContentLoaded", () => {
    getMixes();
    getFertUsage();
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("/logout", {
            method: "POST", 
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");

            window.location.href = "/index.html";
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        location.reload();

        document.getElementById("logoutModal").style.display = "flex";
    } catch (err) {
        console.error(err);
        alert("Logout failed");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutOkBtn = document.getElementById("logoutOkBtn");
    if (logoutOkBtn) {
        logoutOkBtn.addEventListener("click", () => {
            document.getElementById("logoutModal").classList.add("hidden");
            window.location.href = "./index.html";
        });
    }
});
