
import User from './User.js';
import Transaction from './Transaction.js';
import Book from './Book.js';

// Define associations
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',  // alias for eager loading
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Book.hasMany(Transaction, {
  foreignKey: 'bookId',
  as: 'transactions',
});

Transaction.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book',
});
