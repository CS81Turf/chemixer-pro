const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const epaRoutes = require('./routes/epaRoutes');

const app = express();

// Enable JSON parsing for requests
app.use(express.json());

// Register EPA routes
app.use('/api/epa', epaRoutes);

// Serve static files from the project's public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback route: serve public/index.html for the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
