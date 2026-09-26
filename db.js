const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.log("MONGO_URI nahi mila, DB ke bina server chal raha hai ⚠️");
      return;
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Yaha process.exit hata diya, taaki server crash na ho
  }
};

module.exports = connectDB;