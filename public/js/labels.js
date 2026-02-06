// -----------------------------
// Constants & Elements
// -----------------------------
const API_BASE = "/api/epa";

const searchButton = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const searchTypeRadios = document.querySelectorAll('input[name="searchType"]');

searchTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const type = e.target.value;

    if (type === "weed") {
      searchInput.placeholder = "Enter weed name...";
    } else {
      searchInput.placeholder = "Enter product name...";
    }
  });
});

// -----------------------------
// Helpers
// -----------------------------
function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function isActiveProduct(product) {
  return normalize(product.product_status) !== "inactive";
}

/**
 * Display results in cards
 */
function displayJsonResults(items) {
  if (!items || items.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  const cards = items.map((item) => {
    const productName = item.productname || "N/A";
    const signalWord = item.signal_word || "N/A";
    const status = item.product_status || "N/A";
    const activeIngredients = item.active_ingredients || [];

    const activeList = activeIngredients
      .map(
        (ing) =>
          `<li>${ing.active_ing || "N/A"} - ${ing.active_ing_percent || "N/A"}%</li>`
      )
      .join("");

    return `
      <div class="label-card">
        <h3>${productName}</h3>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Signal Word:</strong> ${signalWord}</p>
        <p><strong>Active Ingredients:</strong></p>
        <ul>${activeList}</ul>
      </div>
    `;
  });

  resultsDiv.innerHTML = cards.join("");
}

// -----------------------------
// Search: Product
// -----------------------------
async function searchByProduct(query) {
  if (!query) {
    resultsDiv.innerHTML = "<p>Please enter a product name.</p>";
    return;
  }

  resultsDiv.innerHTML = "Searching products...";

  try {
    const res = await fetch(
      `${API_BASE}/search?product=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const parsed = JSON.parse(data.result);
    const items = parsed.items || [];

    const results = items
      .filter(isActiveProduct)
      .filter((p) =>
        normalize(p.productname).includes(normalize(query))
      );

    displayJsonResults(results);

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Error searching products.</p>";
  }
}

// -----------------------------
// Search: Weed
// -----------------------------
async function searchByWeed(weed) {
  if (!weed) {
    resultsDiv.innerHTML = "<p>Please enter a weed name.</p>";
    return;
  }

  const weed = normalize(weed);
  resultsDiv.innerHTML = "Searching weeds...";

  try {
    const res = await fetch(
      `${API_BASE}/epa/weed-search?weed=${encodeURIComponent(weed)}`
    );
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const parsed = JSON.parse(data.result);
    const items = parsed.items || [];

    const results = items.filter((product) => {
      if (!isActiveProduct(product)) return false;
      if (!Array.isArray(product.pests)) return false;

      return product.pests.some(
        (p) => normalize(p.pest) === weed
      );
    });

    displayJsonResults(results);
    console.log("Weed search results:", results);

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Error searching weeds.</p>";
  }
}

// -----------------------------
// Event Listeners
// -----------------------------
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const searchType = document.querySelector(
    'input[name="searchType"]:checked'
  ).value;

  if (searchType === "weed") {
    searchByWeed(query);
  } else {
    searchByProduct(query);
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});
