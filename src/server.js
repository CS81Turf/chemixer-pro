import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import { findUserByNameAndPin } from "./services/userService.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Mix from "./models/Mix.js"; // MongoDB model

dotenv.config();

// MONGO CONNECTION

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  });

// SETUP

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const sessions = new Map();

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
    const PRESETS_FILE = path.join(__dirname, "data", "presets.json");
    const data = JSON.parse(fs.readFileSync(PRESETS_FILE, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load presets" });
  }
});

// GET mixes
app.get("/api/mixes", requireAuth, async (req, res) => {
  try {
    const mixes = await Mix.find();
    res.json(mixes);
  } catch (err) {
    console.error("Failed to fetch mixes:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new mix
app.post("/api/mixes", requireAuth, async (req, res) => {
  console.log("POST /api/mixes HIT");
  console.log("Body:", req.body);
  console.log("User:", req.user);
  try {
    const user = req.user; // comes from token

    const newMix = await Mix.create({
      ...req.body,
      savedAt: new Date(),
      savedBy: user.name,
      userId: user.userId,
    });

    res.status(201).json({ message: "Mix saved!", mix: newMix });
  } catch (err) {
    console.error("Failed to save mix:", err);
    res.status(500).json({ error: err.message });
  }
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

app.listen(port, () => console.log(`Server running on port ${port}`));
