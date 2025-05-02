import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

const Transaction = sequelize.define(
  'transactions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transactionType: {
      type: DataTypes.ENUM('purchase', 'sale'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'failed'),
      allowNull: false,
      defaultValue: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

export default Transaction;
