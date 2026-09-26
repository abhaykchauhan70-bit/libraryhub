const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db.js');

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// API Routes - hamesha upar
app.use('/api/auth', require('./authRoutes.js'));
app.use('/api/books', require('./bookRoutes.js'));

app.get("/api", (req, res) => {
  res.json({ message: "LibraryHub API is running 🟢" });
});

// API ke liye 404 JSON, HTML nahi
app.use('/api', (req, res) => {
  return res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// Frontend
app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));