const API_BASE = "https://ordspub.epa.gov/ords/pesticides/cswu/pplstxt";

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
        const response = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`);
        const data = await response.json();

        console.log(data); // Log the data for debugging

        const items = data.items || [];

        if (items.length === 0) {
            resultsDiv.innerHTML = '<p>No results found for <strong>${query}</strong></p>';
            return;
        }

        displayJsonResults(items, resultsDiv);

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = '<p>Error fetching data from the EPA API.</p>';
    }
});

// Function to display JSON results in a formatted way
function displayJsonResults(data, resultsDiv) {

    const cards = items.map(item => {
        const productName = item.product_name || 'N/A';
        

        return `
            <div class="label-card">
                <h3>${productName}</h3>
                ${pdfUrl ? `<a href="${pdfUrl}" target="_blank">View Label PDF</a>` : '<p>No PDF available</p>'}
            </div>
        `;
    }).join('');

    resultsDiv.innerHTML = cards;
}