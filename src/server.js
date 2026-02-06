import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import { findUserByNameAndPin } from "./services/userService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//-------------------------
// In-memory stores
//-------------------------
const sessions = new Map();
let weedIndexCache = {};
let weedIndexLastBuilt = null;
const WEED_INDEX_TTL = 1000 * 60 * 60 * 24; 

const app = express();
const port = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "..", "images")));

// Middleware to require login
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  // Expect header: "Bearer <token>"
  const token = authHeader.replace("Bearer ", "").trim();
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Attach user info to request
  req.user = session;
  next();
}

// Database file path
const MIXES_FILE = path.join(__dirname, "mixes.json");
// Path to presets.json
const PRESETS_FILE = path.join(__dirname, "data", "presets.json");

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

// User authentication

// POST login
app.post("/login", (req, res) => {
  const { name, pin } = req.body;

  if (!name || !pin) {
    return res.status(400).json({ error: "Name and pin required" });
  }

  const user = findUserByNameAndPin(name, pin);

  if (!user) {
    return res.status(401).json({ error: "Invalid name or PIN" });
  }

  // Generate a token (simple UUID for demo purposes)
  const token = crypto.randomUUID();

  // Store session in memory (Map) for now
  sessions.set(token, {
    userId: user.id,
    name: user.name,
    role: user.role,
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    token,
  });
});

// POST logout
app.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ success: true });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  sessions.delete(token);

  res.json({ success: true });
});

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
  try {
    const mixes = readMixes();
    res.json(mixes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read mixes." });
  }
});

// POST new mix
app.post("/api/mixes", requireAuth, (req, res) => {
  const user = req.user; // comes from token

  const newMix = {
    ...req.body,
    savedAt: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
    savedBy: user.name,
    userId: user.userId,
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

// Build Weed Index
async function buildWeedIndex() {
  console.log("Building Weed Index...");

  const seeds = [
    "2,4-D",
    "dicamba",
    "quinclorac",
    "triclopyr",
    "metsulfuron",
    "glyphosate,"
  ];

  const index = {};

  for (const seed of seeds) {
    const apiUrl = `https://ordspub.epa.gov/ords/pesticides/cswu/pplstxt/${encodeURIComponent(
      seed
    )}`;

    const response = await fetch(apiUrl);
    if (!response.ok) continue;

    const text = await response.text();
    const parsed = JSON.parse(text);
    const items = parsed.items || [];

    items.forEach((product) => {
      if (product.product_status === "Inactive") return;
      if (!Array.isArray(product.pests)) return;

      product.pests.forEach((p) => {
        const pestName = p.pest || p.pest_name || p.pestcommonname;

        if (!pestName) return;

        const weed = pestName.toLowerCase().trim();

        if (!index[weed]) index[weed] = [];
        index[weed].push(product);
      });
    });
  }

  weedIndexCache = index;
  weedIndexLastBuilt = Date.now();

  console.log(`Weed index built with ${Object.keys(index).length} weeds`);
}

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
      productName,
    )}`;

    console.log("Calling EPA API:", apiUrl);

    const response = await fetch(apiUrl);

    console.log("EPA API response status:", response.status);

    if (!response.ok) {
      throw new Error(`EPA API error: ${response.status}`);
    }

    const data = await response.text(); //plain text, not JSON
    console.log("EPA API response data received");

    res.json({ result: data }); // wrap in object for front end
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Failed to fetch data from EPA API" });
  }
});

// Weed Search
app.get("/api/epa/weed-search", async (req, res) => {
  const weed = req.query.weed?.toLowerCase().trim();

  if (!weed) {
    return res.status(400).json({ error: "Missing weed name" });
  }

  if (!weedIndexLastBuilt || Date.now() - weedIndexLastBuilt > WEED_INDEX_TTL) {
    await buildWeedIndex();
  }

  const results = weedIndexCache[weed] || [];

  res.json({
    weed, 
    count: results.length,
    results,
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
