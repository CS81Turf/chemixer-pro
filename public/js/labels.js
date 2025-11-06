const API_BASE = "/api/epa";

const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// Event listener for search button
searchButton.addEventListener('click', async () => {
    const query = searchInput.value;
    if (!query) {
        alert('Please enter a product name.');
        return;
    }

    resultsDiv.innerHTML = 'Searching...';

    try {
        // Fetch from back-end
        const response = await fetch(`/api/epa/search?product=${encodeURIComponent(query)}`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // If the back-end responds with an error status, throw it
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse the JSON 
        const data = await response.json();
        console.log('Success data:', data);
        
        const resultText = data.result || '';

        // Show a message if no results found
        if (!resultText) {
            resultsDiv.innerHTML = `<p>No results found for <strong>${query}</strong></p>`;
            return;
        }

        // Display EPA text 
        resultsDiv.innerHTML = `<pre>${resultText}</pre>`;

    } catch (error) {
        console.error('Error fetching EPA data:', error);
        resultsDiv.innerHTML = '<p>Error fetching data from the EPA API.</p>';
    }
});


// Function to display JSON results in a formatted way
function displayJsonResults(items, resultsDiv) {
    const cards = items.map((item) => {
    const productName = item.productname || "N/A";
    const signalWord = item.signal_word || "N/A";
    const activeIngredients = item.active_ingredients || [];

    const activeList = activeIngredients
      .map((ingredient) => `<li>${ingredient.active_ing} - ${ingredient.active_ing_percent}%</li>`)
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
