  import { Sequelize } from "sequelize";
  import dotenv from "dotenv";

  dotenv.config();

  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  sequelize
    .authenticate()
    .then(() => console.log("Database connected!"))
    .catch((err) => console.error("Unable to connect to the database:", err));

    sequelize.sync({ alter: true }) 
  .then(() => console.log("All tables created successfully"))
  .catch((error) => console.error("Error syncing database:", error));

  export default sequelize;
