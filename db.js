const mongoose = require("mongoose");

// Connects to MongoDB using the connection string in .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // stop the app if the database can't connect
  }
};

module.exports = connectDB;
