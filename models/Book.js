import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'postgres',
    username: 'postgres',
    password: 'angele',
    database: 'practice',
    host: 'localhost',
    port: 5432,
});

const Book = sequelize.define(
    "books",
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
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        totalPrice: {
            type: DataTypes.VIRTUAL, 
            get() {
                return (this.quantityInStock * this.unitPrice).toFixed(2);
            },
            set(value) {
            
                throw new Error('totalPrice cannot be set directly.');
            }
        },
    },
    {
        timestamps: false,
        indexes: [
        
            {
                name: "idx_bookName",
                fields: ["bookName"],
            },
    
            {
                name: "idx_description",
                fields: ["description"],
            },
        
            {
                name: "idx_quantityr",
                fields: ["quantityInStock"],
            },
            {
                name: "idx_unitPrice",
                fields: ["unitPrice"],
            },
            {
                name: "idx_totalPrice",
                fields: ["totalPrice"],
            },
        ],
    }
);


sequelize.sync({ alter: true })
    .then(() => {
        console.log("Data table created successfully");
    })
    .catch((error) => {
        console.error("Error creating the data table:", error);
    });

export default Book;
