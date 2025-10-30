const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Then handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
