// routes/bookRoutes.js
import express from 'express';
import { buyBook } from '../controllers/transactionController.js';
import authentication from '../middlewares/authMiddleware.js'; 
import roleMiddleware from '../middlewares/roleMiddleware.js'; 
import sessionTimeout from '../middlewares/sessionTimeout.js';


const router = express.Router();
router.post('/buy/:bookId', authentication, sessionTimeout,roleMiddleware(['user']), buyBook);

export default router;
