import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';


const Book = sequelize.define(
  'books',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    bookName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 125],
      },
    },
    bookCover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    publishingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    status: {
      type: DataTypes.ENUM('Arrived', 'In Transit'),
      allowNull: false,
      defaultValue: 'In Transit',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },      
  {
    timestamps: false,
    indexes: [
      {
        name: 'idx_bookName',
        fields: ['bookName'],
      },
      {
        name: 'idx_description',
        fields: ['description'],
      },
      {
        name: 'idx_quantityInStock',
        fields: ['quantityInStock'],
      },
      {
        name: 'idx_unitPrice',
        fields: ['unitPrice'],
      },
      {
        name: 'idx_totalPrice',
        fields: ['totalPrice'],
      },
    ],
  },
  {
    timestamps: false,
  }
);

export default Book;
