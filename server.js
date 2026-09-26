require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');

const app = express();

// ===== Middleware =====
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== Connect to MongoDB =====
connectDB();

// ===== API Routes - Ye sabse pehle hona chahiye =====
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// ===== Health check - API ke liye =====
app.get("/api", (req, res) => {
  res.json({ message: "LibraryHub API is running ✅" });
});

// ===== Frontend serve =====
app.use(express.static(__dirname));

app.get("*", (req, res) => {
  // Agar request /api se start hoti hai toh HTML mat bhejo, JSON error bhejo
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: `API route ${req.originalUrl} not found` });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));