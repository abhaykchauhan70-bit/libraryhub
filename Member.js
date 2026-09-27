const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
  joinDate: Date,
  lastLogin: Date,
  loginCount: {type:Number, default:0},
  booksIssued: [{
    bookId: String,
    title: String,
    issueDate: Date,
    returnDate: Date,
    status: String
  }]
});
module.exports = mongoose.model('Member', memberSchema);