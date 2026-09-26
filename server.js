const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db.js');

dotenv.config();

const app = express();

// Database connect
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// ===== API Routes =====
app.use('/api/auth', require('./authRoutes.js'));
app.use('/api/books', require('./bookRoutes.js'));

// Test route - ye Render pe check karne ke liye
app.get("/api", (req, res) => {
  res.json({ message: "LibraryHub API is running 🟢" });
});

// ===== Frontend Serve - FIXED CODE =====
app.use(express.static(path.join(__dirname)));

// Ye sabse important fix hai - "" ki jagah "*" lagaya hai
app.get("*", (req, res) => {
  // Agar API ka route galat hai to HTML mat bhejo, 404 bhejo
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: `API route ${req.originalUrl} not found` });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));