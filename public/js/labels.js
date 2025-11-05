const API_BASE = "/api/epa";

const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// Event listener for search button
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
        alert ('Please enter a product name to search.');
        return;
    }

    // Indicate loading state
    resultsDiv.innerHTML = 'Searching...';

    try {
        const response = await fetch(`${API_BASE}/search?product=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }   

        const data = await response.json();

        const items = data.items || [];

        if (items.length === 0) {
            resultsDiv.innerHTML = `<p>No results found for <strong>${query}</strong></p>`;
            return;
        }

        displayJsonResults(items, resultsDiv);

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = '<p>Error fetching data from the EPA API.</p>';
    }
});

// Function to display JSON results in a formatted way
function displayJsonResults(items, resultsDiv) {

    const cards = items.map(item => {
        const productName = item.product_name || 'N/A';
        const pdfUrl = item.pdf_url || null;

        return `
            <div class="label-card">
                <h3>${productName}</h3>
                <div class="product-details">
                    <p><strong>EPA Registration Number:</strong> ${regNumber}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Signal Word:</strong> ${signalWord}</p>
                    <p><strong>Restricted Use:</strong> ${restricted}</p>
                    <div class="active-ingredients">
                        <h4>Active Ingredients:</h4>
                        <ul>${activeIngredients}</ul>
                    </div>
            </div>
        `;
    }).join('');

    resultsDiv.innerHTML = cards;
}