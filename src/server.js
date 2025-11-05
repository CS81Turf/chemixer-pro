const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require('cors');

const app = express();

// Enable CORS 
app.use(cors());

//Parse JSON bodies
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/epa/search', async (req, res) => {
    try {
        const product = req.query.product;
        
        if (!product) {
            return res.status(400).json({ 
                error: 'Product name is required' 
            });
        }

        // Mock response for testing
        res.json({
            items: [{
                PRODUCTNAME: product,
                EPAREGNO: "1234-56",
                PRODUCT_STATUS: "Active",
                SIGNAL_WORD: "Warning",
                RUP_YN: "No",
                ACTIVE_INGREDIENTS: [{
                    ACTIVE_ING: "Test Ingredient",
                    ACTIVE_ING_PERCENT: "50"
                }],
                PDFFILES: {
                    PDFFILE: ["http://example.com/label.pdf"]
                }
            }]
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Then handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
