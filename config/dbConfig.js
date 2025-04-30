import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } =pkg

dotenv.config(); 

// Create a new Pool instance for PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD, 
  host: process.env.DB_HOST,        
  port: process.env.DB_PORT,         
  database: process.env.DB_NAME,     
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring the client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release(); // Release the client back to the pool
});

export default pool;
