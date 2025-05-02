// routes/bookRoutes.js
import express from 'express';
import transactionController from '../controllers/transactionController.js';
import authentication from '../middlewares/authMiddleware.js'; 
import roleMiddleware from '../middlewares/roleMiddleware.js'; 
import {sessionTimeout} from '../middlewares/sessionTimeout.js';


const router = express.Router();
router.post('/buy/:bookId', authentication, sessionTimeout,transactionController.buyBook);
router.get('/my-transactions', authentication, sessionTimeout, transactionController.getUserTransactions);

export default router;
