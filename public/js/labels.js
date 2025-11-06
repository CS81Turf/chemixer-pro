const API_BASE = "/api/epa";

const searchButton = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

// Event listener for search button
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a product name.");
    return;
  }

  resultsDiv.innerHTML = "Searching...";

  try {
    // Fetch from back-end
    const response = await fetch(
      `${API_BASE}/search?product=${encodeURIComponent(query)}`
    );
    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();
    console.log("Success data:", data);

    // Parse results into JSON
    let resultsArray;
    try {
      const parsed = JSON.parse(data.result);
      resultsArray = parsed.items;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      resultsDiv.innerHTML = "<p>Error parsing data from the EPA API.</p>";
      return;
    }

    if (!resultsArray || resultsArray.length === 0) {
      resultsDiv.innerHTML = `<p>No results found for <strong>${query}</strong></p>`;
      return;
    }

    // Display the JSON results as cards
    displayJsonResults(resultsArray, resultsDiv);
  } catch (error) {
    console.error("Error fetching EPA data:", error);
    resultsDiv.innerHTML = "<p>Error fetching data from the EPA API.</p>";
  }
});

// Function to display JSON results in a formatted way
function displayJsonResults(items, resultsDiv) {
  const cards = items.map((item) => {
    const productName = item.productname || "N/A";
    const signalWord = item.signal_word || "N/A";
    const activeIngredients = item.active_ingredients || [];

    const activeList = activeIngredients
      .map(
        (ingredient) =>
          `<li>${ingredient.active_ing} - ${
            ingredient.active_ing_percent || "N/A"
          }%</li>`
      )
      .join("");

    return `
            <div class="label-card">
                <h3>${productName}</h3>
                <p><strong>Signal Word:</strong> ${signalWord}</p>
                <p><strong>Active Ingredients:</strong></p>
                <ul>${activeList}</ul>
            </div>
        `;
  });

  resultsDiv.innerHTML = cards.join("");
}
