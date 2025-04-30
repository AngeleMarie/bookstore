// import { Book } from "../models/Book.js";
// import { User } from "../models/User.js";
// import _ from 'lodash';

// export const buyBook = async (req, res) => {
//   try {
//     const { bookId } = req.params;
//     const userId = req.user.id; 

//     const book = await Book.findByPk(bookId);
//     if (!book || book.quantityInStock <= 0) {
//       return res.status(404).json({ message: "Book not available." });
//     }

//     const user = await User.findByPk(userId);
//     const admin = await User.findOne({ where: { role: "admin" } });

//     if (!user || !admin) {
//       return res.status(404).json({ message: "User or Admin not found." });
//     }

//     if (user.balance < book.unitPrice) {
//       return res.status(400).json({ message: "Insufficient balance." });
//     }

//     // Use lodash to update safely
//     user.balance = _.round(user.balance - book.unitPrice, 2);
//     admin.balance = _.round(admin.balance + book.unitPrice, 2);
//     book.quantityInStock = book.quantityInStock - 1;

//     await Promise.all([
//       user.save(),
//       admin.save(),
//       book.save()
//     ]);

//     return res.status(200).json({ message: "Purchase successful!" });

//   } catch (error) {
//     console.error("Error during purchase:", error);
//     res.status(500).json({ message: "Error during purchase." });
//   }
// };
