import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import session from 'express-session';

import dbConfig from './config/dbConfig.js';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import swaggerSetup from './swaggerSetup.js';  

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/uploads', express.static('uploads'));
app.use(express.json());


app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/admin', adminRoutes);


swaggerSetup(app);

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
