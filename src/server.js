import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));

// Route for index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Fetch by product name
app.get("/api/epa/search", async (req, res) => {
  const productName = req.query.product;
  console.log("Received search request for:", productName);

  if (!productName) {
    res.status(400).json({ error: "Missing product name" });
    return;
  }

  try {
    // Endpoint for search by product name (from EPA docs)
    const apiUrl = `https://ordspub.epa.gov/ords/pesticides/cswu/pplstxt/${encodeURIComponent(
      productName
    )}`;

    console.log("Calling EPA API:", apiUrl);

    const response = await fetch(apiUrl);

    console.log("EPA API response status:", response.status);

    if (!response.ok) {
      throw new Error(`EPA API error: ${response.status}`);
    }

    const data = await response.text(); //plaint text, not JSON
    console.log("EPA API response data received");
  

    res.json({ result: data }); // wrap in object for front end
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Failed to fetch data from EPA API" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
