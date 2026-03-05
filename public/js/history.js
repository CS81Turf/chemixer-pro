console.log("Token on history page:", localStorage.getItem("token"));

// ─── Global Data & Pagination State ───────────────────────────────────────────
// allMixes and allFertUsage hold the FULL dataset returned from the API.
// We never slice these — they're the source of truth.
// currentMixPage / currentFertPage track which page each table is on.
let allMixes = [];
let allFertUsage = [];
let currentMixPage = 1;
let currentFertPage = 1;

const PAGE_SIZE = 10;


// ─── API Fetching ──────────────────────────────────────────────────────────────

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
        console.error("Error loading mixes:", err);
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
        renderCalendar();
    } catch (err) {
        console.error("Error loading fertilizer usage history:", err);
        document.getElementById("fert-usage-table").innerHTML = "<p>Error loading fertilizer usage history.</p>";
    }
}


// ─── Display (entry points) ────────────────────────────────────────────────────
// These are called once after the API responds. They calculate the total number
// of pages and kick off the first render.

function displayMixes(mixesToShow) {
    const totalPages = Math.ceil(mixesToShow.length / PAGE_SIZE);
    currentMixPage = Math.min(currentMixPage, totalPages || 1);
    renderMixPage(mixesToShow, currentMixPage, totalPages);
}

function displayFertUsage(fertUsageToShow) {
    const totalPages = Math.ceil(fertUsageToShow.length / PAGE_SIZE);
    currentFertPage = Math.min(currentFertPage, totalPages || 1);
    renderFertPage(fertUsageToShow, currentFertPage, totalPages);
}


// ─── Page Renderers ────────────────────────────────────────────────────────────
// These are called every time the user changes page. They slice out the 10
// records for the current page, build the HTML, inject it into the DOM, then
// wire up the pagination button click handlers.

function renderMixPage(mixes, page, totalPages) {
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = mixes.slice(start, start + PAGE_SIZE);

    // pageItems  → only the 10 rows to show
    // mixes      → the full array, so totals footer covers everything
    const tableHtml = createMixTable(pageItems, mixes);
    const paginationHtml = createPaginationControls(page, totalPages, mixes.length, "mix");

    document.getElementById("past-mix-table").innerHTML = tableHtml + paginationHtml;

    document.querySelectorAll(".pagination-btn[data-table='mix']").forEach(btn => {
        btn.addEventListener("click", () => {
            currentMixPage = Number(btn.dataset.page);
            renderMixPage(allMixes, currentMixPage, totalPages);
            document.getElementById("past-mix-table").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function renderFertPage(fertUsage, page, totalPages) {
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = fertUsage.slice(start, start + PAGE_SIZE);

    const tableHtml = createFertUsageTable(pageItems, fertUsage);
    const paginationHtml = createPaginationControls(page, totalPages, fertUsage.length, "fert");

    document.getElementById("fert-usage-table").innerHTML = tableHtml + paginationHtml;

    document.querySelectorAll(".pagination-btn[data-table='fert']").forEach(btn => {
        btn.addEventListener("click", () => {
            currentFertPage = Number(btn.dataset.page);
            renderFertPage(allFertUsage, currentFertPage, totalPages);
            document.getElementById("fert-usage-table").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}


// ─── Pagination Controls Builder ──────────────────────────────────────────────
// Builds the "← Prev  1  2  3 … 9  Next →" bar as an HTML string.
// data-table and data-page attributes are how the click handlers know
// which table and which page to navigate to.

function createPaginationControls(currentPage, totalPages, totalItems, tableKey) {
    if (totalPages <= 1) return "";

    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);

    // Build the numbered page buttons, collapsing distant pages into "…"
    function pageButtons() {
        const buttons = [];
        const delta = 2; // how many pages to show on each side of the current page

        const range = [];
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        buttons.push(pageBtn(1, currentPage, tableKey));

        if (range[0] > 2)
            buttons.push(`<span class="pagination-ellipsis">…</span>`);

        range.forEach(p => buttons.push(pageBtn(p, currentPage, tableKey)));

        if (range[range.length - 1] < totalPages - 1)
            buttons.push(`<span class="pagination-ellipsis">…</span>`);

        if (totalPages > 1)
            buttons.push(pageBtn(totalPages, currentPage, tableKey));

        return buttons.join("");
    }

    const prevDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";

    return `
    <div class="pagination-wrapper">
        <span class="pagination-info">Showing ${start}–${end} of ${totalItems}</span>
        <div class="pagination-controls">
            <button class="pagination-btn pagination-nav ${prevDisabled}"
                data-table="${tableKey}"
                data-page="${currentPage - 1}"
                ${prevDisabled}>← Prev</button>

            ${pageButtons()}

            <button class="pagination-btn pagination-nav ${nextDisabled}"
                data-table="${tableKey}"
                data-page="${currentPage + 1}"
                ${nextDisabled}>Next →</button>
        </div>
    </div>`;
}

// Builds a single numbered page button
function pageBtn(page, currentPage, tableKey) {
    const active = page === currentPage ? "active" : "";
    return `<button class="pagination-btn pagination-page ${active}"
                data-table="${tableKey}"
                data-page="${page}">${page}</button>`;
}


// ─── Table Builders ────────────────────────────────────────────────────────────
// CHANGED: both functions now accept a second parameter (the full dataset).
// The rows loop uses the first param (page slice), but the totals footer
// loops over the second param (full data) so totals are always accurate
// across all pages, not just the 10 currently visible.

function createMixTable(mixes, allMixesForTotals = mixes) {
    if (!Array.isArray(mixes) || mixes.length === 0) {
        return "<p>No mixes found.</p>";
    }

    // Totals calculated from the FULL dataset
    let totalSqFt = 0;
    let totalWaterVol = 0;
    const chemicalTotals = {};

    allMixesForTotals.forEach((mix) => {
        totalSqFt += Number(mix.areaSize) || 0;
        totalWaterVol += Number(mix.waterVolume) || 0;

        const results = Array.isArray(mix.results) ? mix.results : [];
        results.forEach((r) => {
            const chem = r.chemical || "Unknown";
            const amount = Number(r.totalAmount) || 0;
            if (!chemicalTotals[chem]) chemicalTotals[chem] = 0;
            chemicalTotals[chem] += amount;
        });
    });

    // Rows built from the current PAGE only
    let rows = mixes.map((mix) => {
        const results = Array.isArray(mix.results) ? mix.results : [];
        let chemicals = results.map((r) => {
            const chem = r.chemical || "Unknown";
            const amount = Number(r.totalAmount) || 0;
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

    // Totals footer
    const chemicalTotalsHtml = Object.entries(chemicalTotals).map(([name, amount]) => {
        const gallons = amount / 128;
        return `${name}: ${amount.toFixed(2)} oz (${gallons.toFixed(2)} gal)`;
    }).join("<br>");

    const totalsRow = `
    <tr class="totals-row">
    <td colspan="6">
       <div><strong>TOTAL SQ. FT.: ${totalSqFt.toLocaleString("en-US")}</strong></div>
       <div><strong>TOTAL WATER VOL.: ${totalWaterVol.toLocaleString("en-US")} gal</strong></div>
       <div><strong>Chemicals:</strong></div>
       ${chemicalTotalsHtml}
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

function createFertUsageTable(fertUsage, allFertForTotals = fertUsage) {
    if (!Array.isArray(fertUsage) || fertUsage.length === 0) {
        return "<p>No fertilizer usage found</p>";
    }

    // Totals calculated from the FULL dataset
    let totalBags = 0;
    const fertilizerTotals = {};

    allFertForTotals.forEach((entry) => {
        const bags = Number(entry.bagsUsed) || 0;
        const type = entry.fertilizerType || "Unknown";
        totalBags += bags;
        if (!fertilizerTotals[type]) fertilizerTotals[type] = 0;
        fertilizerTotals[type] += bags;
    });

    // Rows built from the current PAGE only
    let rows = fertUsage.map((entry) => {
        const bags = Number(entry.bagsUsed) || 0;
        const type = entry.fertilizerType || "Unknown";

        return `
    <tr>
    <td>${entry.date}</td>
    <td>${type}</td>
    <td>${bags}</td>
    <td>${entry.userName || "Unknown"}</td>
    </tr>`;
    }).join("");

    // Totals footer
    const fertilizerTotalsHtml = Object.entries(fertilizerTotals).map(([type, bags]) => {
        return `${type}: ${bags} bags`;
    }).join("<br>");

    const totalsRow = `
    <tr class="totals-row">
    <td colspan="4">
       <div><strong>TOTALS</strong></div>
       <br>
       <strong>${fertilizerTotalsHtml}</strong>
    </td>
    </tr>`;

    return `
    <div class="past-mix-results">
    <table class="mix-results-table">
    <thead>
    <tr>
    <th>Date</th>
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


// ─── Startup ───────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    getMixes();
    getFertUsage();
});



// ─── Fertilizer Calendar ───────────────────────────────────────────────────────

let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

function renderCalendar() {
    const label = document.getElementById("calMonthLabel");
    const grid = document.getElementById("fertCalendar");
    if (!label || !grid) return;

    label.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

    // Build a set of dates that have fert usage entries this month
    // Key: "YYYY-MM-DD" → array of entries
    const entriesByDate = {};
    allFertUsage.forEach(entry => {
        const dateStr = String(entry.date).slice(0, 10);
        const [y, m] = dateStr.split("-").map(Number);
        if (y === calYear && m === calMonth + 1) {
            if (!entriesByDate[dateStr]) entriesByDate[dateStr] = [];
            entriesByDate[dateStr].push(entry);
        }
    });

    // First day of month (0=Sun) and total days
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    let html = `
    <div class="cal-day-header">Sun</div>
    <div class="cal-day-header">Mon</div>
    <div class="cal-day-header">Tue</div>
    <div class="cal-day-header">Wed</div>
    <div class="cal-day-header">Thu</div>
    <div class="cal-day-header">Fri</div>
    <div class="cal-day-header">Sat</div>`;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day cal-day-empty"></div>`;
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const mm = String(calMonth + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        const dateStr = `${calYear}-${mm}-${dd}`;
        const hasEntries = entriesByDate[dateStr] && entriesByDate[dateStr].length > 0;
        const isToday = dateStr === today;

        const totalBags = hasEntries
            ? entriesByDate[dateStr].reduce((sum, e) => sum + (Number(e.bagsUsed) || 0), 0)
            : 0;

        html += `
        <div class="cal-day ${hasEntries ? "cal-day-has-data" : ""} ${isToday ? "cal-day-today" : ""}"
             data-date="${dateStr}">
            <span class="cal-day-num">${d}</span>
            ${hasEntries ? `<span class="cal-day-badge">${totalBags} bag${totalBags !== 1 ? "s" : ""}</span>` : ""}
        </div>`;
    }

    grid.innerHTML = html;

    // Click handlers for days with data
    grid.querySelectorAll(".cal-day-has-data").forEach(cell => {
        cell.addEventListener("click", () => {
            const dateStr = cell.dataset.date;
            openFertDayModal(dateStr, entriesByDate[dateStr]);
        });
    });
}

function openFertDayModal(dateStr, entries) {
    const modal = document.getElementById("fertDayModal");
    const title = document.getElementById("fertDayModalTitle");
    const body = document.getElementById("fertDayModalBody");

    // Format date nicely e.g. "March 4, 2026"
    const [y, m, d] = dateStr.split("-").map(Number);
    title.textContent = `${MONTH_NAMES[m - 1]} ${d}, ${y}`;

    let html = `<table class="fert-day-table">
        <thead><tr><th>Employee</th><th>Fertilizer</th><th>Bags Used</th></tr></thead>
        <tbody>`;

    entries.forEach(e => {
        html += `<tr>
            <td>${e.userName || "Unknown"}</td>
            <td>${e.fertilizerType || "Unknown"}</td>
            <td>${e.bagsUsed || 0}</td>
        </tr>`;
    });

    const totalBags = entries.reduce((sum, e) => sum + (Number(e.bagsUsed) || 0), 0);
    html += `</tbody>
        <tfoot>
            <tr class="totals-row"><td colspan="2"><strong>Total</strong></td><td><strong>${totalBags}</strong></td></tr>
        </tfoot>
    </table>`;

    body.innerHTML = html;
    modal.classList.remove("hidden");
}

// ─── Calendar Startup ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calPrevBtn").addEventListener("click", () => {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendar();
    });

    document.getElementById("calNextBtn").addEventListener("click", () => {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderCalendar();
    });

    document.getElementById("fertDayModalClose").addEventListener("click", () => {
        document.getElementById("fertDayModal").classList.add("hidden");
    });

    // Close modal on backdrop click
    document.getElementById("fertDayModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("fertDayModal")) {
            document.getElementById("fertDayModal").classList.add("hidden");
        }
    });
});