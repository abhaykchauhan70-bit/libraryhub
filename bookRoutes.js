const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");
const {
  getBooks,
  getBookStats,
  addBook,
  updateBook,
  deleteBook,
} = require("./bookController");

router.get("/", getBooks); // public: anyone can browse the catalog
router.get("/stats", getBookStats);

router.post("/", protect, addBook); // only logged-in staff can modify data
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;
