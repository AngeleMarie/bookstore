import { DataTypes, Sequelize } from "sequelize";


process.config.DB_USER;

const sequelize = new Sequelize({
  dialect: "postgres",
  username: "postgres",
  password: "angele",
  database: "practice",
  host: "localhost",
  port: 5432,
});

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 250], // Updated length for fullName
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
      unique: true, // Ensure the phone number is unique
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
      type: DataTypes.ENUM("admin", "client"), 
      allowNull: false,
      defaultValue: "client", 
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
      type: DataTypes.FLOAT, // or DOUBLE
      allowNull: false,
      defaultValue: 0, // start with 0 balance
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 500], // Length for address field
      },
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true, // URL or path to the profile image
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        name: "tb_fullName",
        fields: ["fullName"], // Index for fullName
      },
      {
        name: "tb_email",
        fields: ["email"], // Index for email
      },
      {
        name: "tb_phoneNumber",
        fields: ["phoneNumber"], // Index for phoneNumber
      },
      {
        name: "tb_role",
        fields: ["role"], // Index for role
      },
      {
        name: "tb_address",
        fields: ["address"], // Index for address
      },
      {
        name: "tb_activationCode",
        fields: ["activationCode"], // Index for activationCode
      },
      {
        name: "tb_balance",
        fields: ["balance"], // Index for balance

      },
      {
        name: "tb_status",
        fields: ["status"], // Index for address
      },
    ],
  }
);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Data table created successfully");
  })
  .catch((error) => {
    console.error("Error creating the data table:", error);
  });

export default User;
