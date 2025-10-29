const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/about', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'about.html'));
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
