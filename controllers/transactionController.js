import Book from "../models/Book.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import _ from 'lodash';

 const buyBook = async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user.id; 
    try {
    
        const book = await Book.findByPk(bookId);
        const user = await User.findByPk(userId);
        const admin = await User.findOne({ where: { role: 'admin' } });

        if (!book || book.quantity <= 0) {
            return res.status(404).json({ message: "Book not available." });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admins cannot purchase books." });
        }

        if (user.balance < book.unitPrice) {
            return res.status(400).json({ message: "Insufficient balance." });
        }

        const transaction = await User.sequelize.transaction();

        try {
            user.balance -= book.unitPrice;
            admin.balance += book.unitPrice;
            book.quantity -= 1;

            await user.save({ transaction });
            await admin.save({ transaction });
            await book.save({ transaction });

            await Transaction.create({
                userId: user.id,
                adminId: admin.id,
                bookId: book.id,
                amount: book.unitPrice,
                transactionType: 'purchase',
                status: 'completed',
            }, { transaction });

            // Commit the transaction
            await transaction.commit();

            res.status(200).json({ message: "Purchase successful!" });

        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: "Error during purchase." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

const getUserTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: 'book',  // Use the alias defined for the book relation
          attributes: ['id', 'bookName', 'unitPrice'],
        },
        {
          model: User,
          as: 'user',  // Use the correct alias 'user' here for the user relation
          attributes: ['id', 'firstName', 'lastName', 'email'],
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export default {buyBook, getUserTransactions};
