const Book = require("./Book");

// GET /api/books  -> also powers your "stat-books-preview" number
const getBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
};

// GET /api/books/stats -> quick counts for your dashboard cards
const getBookStats = async (req, res) => {
  const totalTitles = await Book.countDocuments();
  const totalCopies = await Book.aggregate([
    { $group: { _id: null, sum: { $sum: "$totalCopies" } } },
  ]);
  res.json({
    totalTitles,
    totalCopies: totalCopies[0]?.sum || 0,
  });
};

// POST /api/books  -> add a new book (also used when a barcode scanner sends an ISBN)
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;
    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/books/:id -> edit a book
const updateBook = async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
};

// DELETE /api/books/:id -> remove a book
const deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({ message: "Book deleted" });
};

module.exports = { getBooks, getBookStats, addBook, updateBook, deleteBook };
