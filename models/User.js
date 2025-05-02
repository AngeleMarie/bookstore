import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 250],
      },
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 250],
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 15],
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [8, 125],
      },
    },

    role: {
      type: DataTypes.ENUM('admin', 'client'),
      allowNull: false,
      defaultValue: 'client',
    },

    activationCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('pending', 'active', 'reset'),
      allowNull: false,
      defaultValue: 'pending',
    },

    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        name: 'tb_firstName',
        fields: ['firstName'],
      },
      {
        name: 'tb_lastName',
        fields: ['lastName'],
      },
      {
        name: 'tb_email',
        fields: ['email'],
      },
      {
        name: 'tb_phoneNumber',
        fields: ['phoneNumber'],
      },
      {
        name: 'tb_role',
        fields: ['role'],
      },
      {
        name: 'tb_address',
        fields: ['address'],
      },
      {
        name: 'tb_activationCode',
        fields: ['activationCode'],
      },
      {
        name: 'tb_balance',
        fields: ['balance'],
      },
      {
        name: 'tb_status',
        fields: ['status'],
      },
    ],
  },
  {
    timestamps: false,
  }
);

export default User;
