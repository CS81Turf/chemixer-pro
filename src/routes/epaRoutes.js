import express from 'express';
const router = express.Router();
import epaApi from '../services/epaApi.js';

/**
 * Search EPA labels by product name
 * Example: GET /api/epa/search?product=Roundup
 */
router.get('/search', async (req, res) => {
    try {
        const { product } = req.query;
        if (!product) {
            return res.status(400).json({ 
                error: 'Product name is required',
                example: '/api/epa/search?product=Glyphosate'
            });
        }
        
        console.log(`Searching for product: ${product}`);
        const results = await epaApi.searchLabelsByProduct(product);
        
        if (!results) {
            return res.status(404).json({
                error: 'No results found',
                searchedFor: product
            });
        }
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ 
            error: 'Failed to search for product',
            details: error.message 
        });
    }
});

export default router;