const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
require('dotenv').config();

const app = express();

// ===== Middleware =====
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.static(__dirname)); // frontend serve karne ke liye

// ===== Connect to MongoDB =====
connectDB();

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// ===== Health check =====
app.get("/", (req, res) => {
  res.send("LibraryHub API is running ✅");
});

// Frontend ke liye - koi bhi aur route ho toh index.html bhej do
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));