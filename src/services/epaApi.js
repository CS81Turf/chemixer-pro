const axios = require('axios');

// EPA Search endpoint
const EPA_BASE_URL = 'https://ordspub.epa.gov/ords/pesticides/cswu/pplstxt/';

/**
 * Service for interacting with the EPA Pesticide Product Label System (PPLS) API
 */
class EPAApiService {
    /**
     * Search for chemical labels by product name
     * @param {string} productName - Name of the product to search (e.g., "Roundup")
     * @returns {Promise<Array>} Array of matching labels
     */
    async searchLabelsByProduct(productName) {
        try {
            // Log the search attempt
            console.log(`Making EPA API request for: ${productName}`);
            const url = `${EPA_BASE_URL}${encodeURIComponent(productName)}`;
            console.log('Full URL:', url);
            
            // Make the request
            const response = await axios.get(url);
            
            // Log successful response
            console.log('EPA API Response:', {
                status: response.status,
                statusText: response.statusText,
                dataType: typeof response.data,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('Error searching EPA labels:', error.message);
            if (error.response) {
                console.error('EPA API Response:', error.response.data);
            }
            throw new Error('Failed to search chemical labels');
        }
    }
}

module.exports = new EPAApiService();