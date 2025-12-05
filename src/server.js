import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const MIXES_FILE = path.join(__dirname, "mixes.json");

function readMixes() {
  if (!fs.existsSync(MIXES_FILE)) {
    fs.writeFileSync(MIXES_FILE, JSON.stringify([], null, 2));
    return [];
  }
  const data = fs.readFileSync(MIXES_FILE, "utf-8");
  return JSON.parse(data);
}

function writeMixes(mixes) {
  fs.writeFileSync(MIXES_FILE, JSON.stringify(mixes, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));

// Path to presets.json
const PRESETS_FILE = path.join(__dirname, "presets.json");

// GET presets
app.get("/api/presets", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PRESETS_FILE, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load presets" });
  }
});

// GET mixes
app.get("/api/mixes", (req, res) => {
  const mixes = readMixes();
  res.json(mixes);
});

// POST new mix
app.post("/api/mixes", (req, res) => {
  const newMix = {
    ...req.body,
    savedAt: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
  };

  if (!newMix) {
    return res.status(400).json({ error: "Mix data required" });
  }

  const mixes = readMixes();
  mixes.push(newMix);
  writeMixes(mixes);

  res.json({ message: "Mix saved!", mix: newMix });
});

// // DELETE mix POST
// app.delete("/api/mixes/:id", async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);

//     let mixes = readMixes();
   
//     if (id < 0 || id >= mixes.length) {
//       return res.status(404).json({ error: "Mix not found." });
//     }

//     mixes.splice(id, 1);
//     writeMixes(mixes);

//     res.json({ success: true, message: "Mix deleted." });
//   } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Failed to delete mix." });
//     }
//   });

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
