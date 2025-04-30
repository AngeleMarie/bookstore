import Book  from "../models/Book.js";
import User  from "../models/User.js";
import bookValidation from "../validators/bookValidation.js";
import _ from 'lodash';

export const buyBook = async (req, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.id; 
      const book = await Book.findByPk(bookId);
      if (!book || book.quantity <= 0) {
        return res.status(404).json({ message: "Book not available." });
      }
  
      const user = await User.findByPk(userId);
      const admin = await User.findOne({ where: { role: "admin" } });
  
      if (user.balance < book.price) {
        return res.status(400).json({ message: "Insufficient balance." });
      }
  
      // Deduct and Update
      user.balance -= book.price;
      admin.balance += book.price;
      book.quantity -= 1;
  
      await user.save();
      await admin.save();
      await book.save();
  
      res.status(200).json({ message: "Purchase successful!" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error during purchase." });
    }
  };
  