import express from 'express';
import userController from '../controllers/userController.js'
import authentication from '../middlewares/authMiddleware.js';
import {sessionTimeout} from '../middlewares/sessionTimeout.js';
import upload from '../middlewares/uploadMiddleware.js';

import dotenv from 'dotenv'
dotenv.config()

const router=express.Router();
router.get('/profile', authentication, sessionTimeout,userController.getCurrentUser);
router.put('/change-details', authentication, sessionTimeout,userController.updateUser);

router.post('/upload-profile-image/:id', authentication, sessionTimeout, upload.single('profileImage'), userController.uploadProfileImage);

router.delete('/remove-profile-image/:id', authentication, sessionTimeout, userController.removeProfileImage);


export default router;

