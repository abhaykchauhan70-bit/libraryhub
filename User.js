const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Defines what a "User" (staff/admin login) looks like in the database
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stored as a hash, never plain text
    role: { type: String, enum: ["admin", "librarian"], default: "librarian" },
  },
  { timestamps: true } // auto-adds createdAt / updatedAt
);

// Password ko save karne se pehle hash karo
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Login ke time password check karne ke liye
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);