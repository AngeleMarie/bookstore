// routes/statisticsRoutes.js
import express from 'express';
import statisticsController from '../controllers/statisticsController.js';
import userController from '../controllers/userController.js';
import isAdmin from '../middlewares/isAdmin.js'; 
import authentication from '../middlewares/authMiddleware.js';
import {sessionTimeout} from '../middlewares/sessionTimeout.js';


const router = express.Router();

router.get('/statistics', authentication, isAdmin, sessionTimeout,statisticsController.getStatistics);
router.get('/clients', authentication, isAdmin, sessionTimeout,userController.getAllClients);
router.get('/search', authentication, isAdmin,sessionTimeout, userController.searchUserByName);





export default router;
