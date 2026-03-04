import { calculateMix } from "./math.js";
import { loadFertPresets } from "./fertPresets.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("loginModal");

  // Show modal if user not logged in
  if (!localStorage.getItem("token")) {
    loginModal.style.display = "flex";
  } else {
    // if already logged in show user
    const userName = localStorage.getItem("userName");
    document.getElementById("currentUser").innerText = `Logged in: ${userName}`;
    loginModal.style.display = "none";
  }

  loginModal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  });
});

document.getElementById("loginBtn").addEventListener("click", handleLogin);

async function handleLogin() {
  const name = document.getElementById("name").value.trim().toLowerCase();;
  const pin = document.getElementById("pin").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin }),
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("loginError").innerText =
        data.error || "Login failed.";
      return;
    }

    const { user, token } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("userName", user.name);

    // Hide Modal
    document.getElementById("loginModal").style.display = "none";

    // Show logged in user
    document.getElementById("currentUser").innerText =
      `Logged in: ${user.name}`;
  } catch (err) {
    console.error(err);
    document.getElementById("loginError").innerText = "Server error";
  }
};

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");

      window.location.href = "./index.html";
      return;
    }

    // Clear Auth
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    location.reload();

    // Reset UI
    document.getElementById("loginModal").style.display = "flex";
    document.getElementById("app").style.display = "none";
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
  if (totalOz < 128) return `${totalOz} oz`;

  const gallons = Math.floor(totalOz / 128);
  const ounces = Math.round(totalOz % 128);

  return ounces === 0
    ? `${gallons} gal${gallons > 1 ? "s" : ""}`
    : `${gallons} gal${gallons > 1 ? "s" : ""} ${ounces} oz`;
}

// Calculate mix logic
const calculateButton = document.getElementById("calculate-btn");
const waterVolumeInput = document.getElementById("water-volume");
const sprayRateInput = document.getElementById("spray-rate");
const treatmentSelect = document.getElementById("treatmentSelect");
const resultsDiv = document.querySelector(".results");

calculateButton.addEventListener("click", async () => {
  if (!PRESETS) await loadPresets();

  const sprayRate = parseFloat(sprayRateInput.value) || 4;
  const waterVolume = parseFloat(waterVolumeInput.value);
  const treatment = treatmentSelect.value;

  try {
    const result = calculateMix(waterVolume, sprayRate, treatment, PRESETS);
    displayResults(result);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
});

function displayResults(data) {
  const { areaSize, waterVolume, sprayRate, treatment, results } = data;

  let html = `
  <div class="label-card results-card">
    <h3>RESULTS FOR:</h3>
    <p><strong>Treatment:</strong> ${treatment}</p>
    <p><strong>Spray Rate:</strong> ${sprayRate} gal/1,000 sq.ft.</p>
    <p><strong>Area:</strong> ${areaSize.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq.ft.</p>
    <p><strong>Water Volume:</strong> ${waterVolume.toFixed(2)} gal</p>
  </div>
  <table class="results-table">
    <tr><th>Chemical</th><th>Rate (oz/1000)</th><th>Total</th></tr>
    ${results.map(r => `<tr><td>${r.chemical}</td><td>${r.ratePer1000}</td><td><strong>${formatOunces(r.totalAmount)}</strong></td></tr>`).join("")}
  </table>
  <button class="saveMixBtn" id="saveMixBtn">Save Mix</button>
  `;

  resultsDiv.innerHTML = html;

  document.getElementById("saveMixBtn").addEventListener("click", () => {
    saveMix({ areaSize, waterVolume, sprayRate, treatment, results });
  });
}

async function saveMix(mixData) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/mixes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(mixData),
    });

    if (!res.ok) {
      const data = await res.json();
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

// -------------------- Fertilizer Usage Logging --------------------
document.getElementById("logFertBtn").addEventListener("click", async () => {
  const presets = await loadFertPresets();
  if (!presets) return alert("Failed to load fertilizer presets");

  // Populate fertilizer dropdown
  const fertilizerSelect = document.getElementById("fertilizerType");
  fertilizerSelect.innerHTML = '<option value="">-- Select fertilizer --</option>';
  const uniqueFerts = new Set();
  Object.values(presets).forEach(p => p.forEach(item => uniqueFerts.add(item.chemical)));
  uniqueFerts.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    fertilizerSelect.appendChild(opt);
  });

  // Auto fill date with today if empty
  const usageDateInput = document.getElementById("usageDate");
  if (usageDateInput && !usageDateInput.value) {
    usageDateInput.valueAsDate = new Date();
  }

  document.getElementById("fertUsageModal").classList.remove("hidden");
});

document.getElementById("logFertCancelBtn").addEventListener("click", () => {
  document.getElementById("fertUsageModal").classList.add("hidden");
  document.getElementById("bagsUsed").value = "";
  document.getElementById("fertilizerType").value = "";
  document.getElementById("fertUsageError").innerText = "";
});

// ----- NEW: Corrected submit handler -----
document.getElementById("logFertSubmitBtn").addEventListener("click", async () => {
  const bagsUsed = parseInt(document.getElementById("bagsUsed").value);
  const fertilizerType = document.getElementById("fertilizerType").value;
  const usageDateInput = document.getElementById("usageDate");
  const errorDiv = document.getElementById("fertUsageError");

  if (!fertilizerType) { errorDiv.innerText = "Please select a fertilizer type"; return; }
  if (isNaN(bagsUsed) || bagsUsed < 0) { errorDiv.innerText = "Please enter a valid number of bags"; return; }
  if (!usageDateInput.value) { errorDiv.innerText = "Please select a date"; return; }

  try {
    const token = localStorage.getItem("token");

    // Use date string directly - no time/timezone needed
    const usageDate = usageDateInput.value; // Already YYYY-MM-DD

    const res = await fetch("/api/fertUsage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fertilizerType, bagsUsed, date: usageDate }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to log fertilizer usage");
    }

    await res.json();
    alert("Fertilizer usage logged successfully!");

    // Reset modal
    document.getElementById("fertUsageModal").classList.add("hidden");
    document.getElementById("bagsUsed").value = "";
    document.getElementById("fertilizerType").value = "";
    usageDateInput.value = "";
    errorDiv.innerText = "";
  } catch (err) {
    console.error("Error logging fertilizer usage:", err);
    errorDiv.innerText = err.message || "Error logging fertilizer usage";
  }
});