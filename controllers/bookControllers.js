import Book from "../models/Book.js";
import bookValidation from "../validators/bookValidation.js";
import _ from "lodash";

// Admin Only: Add book
const addBook = async (req, res) => {
  try {
    const body = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Book cover image is required." });
    }

    const value = await bookValidation.validateAsync(body);

    const {
      bookName,
      description,
      quantityInStock,
      unitPrice,
      status,
      publishingDate,
    } = _.pick(value, [
      "bookName",
      "description",
      "quantityInStock",
      "unitPrice",
      "status",
      "publishingDate",
    ]);

    const newBook = await Book.create({
      bookName,
      description,
      quantityInStock,
      unitPrice,
      publishingDate,
      status,
      bookCover: `/uploads/${file.filename}`,
    });

    return res
      .status(201)
      .json({ message: "Book added successfully", data: newBook });
  } catch (error) {
    console.error("Error adding book:", error);
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    res.status(500).json({ error: "Failed to add book" });
  }
};

// Public: Get all books (only selected fields)
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ["bookName", "description", "bookCover", "unitPrice","status","quantityInStock"],
    });
    res
      .status(200)
      .json({ message: "Books fetched successfully", data: books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, {
      attributes: ["bookName", "description", "bookCover", "unitPrice","status","quantityInStock"],
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Book fetched successfully", data: book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

const updateBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const file = req.file;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: "Book does not exist" });
    }

    if (_.isEmpty(body) && !file) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const value = await bookValidation.validateAsync(body);

    const {
      bookName,
      description,
      quantityInStock,
      unitPrice,
      publishingDate,
      status,
    } = _.pick(value, [
      "bookName",
      "description",
      "quantityInStock",
      "unitPrice",
      "publishingDate",
      "status",
    ]);

    let updatedData = {
      bookName,
      description,
      quantityInStock,
      unitPrice,
      publishingDate,
      status,
    };

    if (file) {
      updatedData.bookCover = `/uploads/${file.filename}`;
    }

    await Book.update(updatedData, { where: { id } });

    const updatedBook = await Book.findByPk(id);
    return res
      .status(200)
      .json({ message: "Book updated successfully", data: updatedBook });
  } catch (error) {
    console.error("Error updating book:", error);
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    res.status(500).json({ error: "Failed to update the book" });
  }
};

// Admin Only: Delete book
const deleteBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};

// Public: Search book by name
const searchBookByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Please provide a name to search." });
    }

    const books = await Book.findAll({
      where: {
        bookName: {
          [Op.iLike]: `%${name}%`, 
        },
      },
      attributes: ["bookName", "description", "bookCover", "unitPrice","status","quantityInStock"],
    });

    if (books.length === 0) {
      return res.status(404).json({ message: "No books found." });
    }

    res
      .status(200)
      .json({ message: "Books fetched successfully", data: books });
  } catch (error) {
    console.error("Error searching book:", error);
    res.status(500).json({ error: "Failed to search books" });
  }
};

export default {
  addBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  searchBookByName,
};
