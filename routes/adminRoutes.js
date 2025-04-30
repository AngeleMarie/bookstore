// routes/statisticsRoutes.js
import express from 'express';
import statisticsController from '../controllers/statisticsController.js';
import userController from '../controllers/userController.js';
import isAdmin from '../middlewares/isAdmin.js'; 
import authentication from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/statistics', authentication, isAdmin, statisticsController.getStatistics);
router.get('/clients', authentication, isAdmin, userController.getAllClients);
router.get('/search', authentication, isAdmin, userController.searchUserByName);


export default router;
