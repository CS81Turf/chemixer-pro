import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const port = process.env.PORT || 3000;
import epaRoutes from './routes/epaRoutes.js';
import cors from 'cors';

// __dirname / __filename replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

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
