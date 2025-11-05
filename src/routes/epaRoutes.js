import express from 'express';
const router = express.Router();
import epaApi from '../services/epaApi.js';

// Base URL for EPA’s PPLS API
const EPA_BASE_URL = 'https://ordspub.epa.gov/ords/pesticides/cswu/pplstxt/';

router.get('/search', async (req, res) => {
    const { product } = req.query; // this gets ?name=something from the frontend

    if (!product) {
        return res.status(400).json({ error: 'Chemical name is required' });
    }

    try {
        // 🔹 Example API call to the EPA system (adjust path based on the correct endpoint)
        const response = await axios.get(
            `${EPA_BASE_URL}search_product?p_search=${encodeURIComponent(product)}`
        );

        // ✅ Send data back to the frontend
        res.json(response.data);

    } catch (error) {
        console.error('EPA API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch EPA data' });
    }
});

export default router;