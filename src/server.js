const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();

// Serve static files from the project's public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback route: serve public/index.html for the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
