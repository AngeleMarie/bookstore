import express from 'express';
import bookController from '../controllers/bookControllers.js';
import authentication from '../middlewares/authMiddleware.js';
import isAdmin from "../middlewares/isAdmin.js";
import upload from '../middlewares/uploadMiddleware.js';
import {sessionTimeout} from '../middlewares/sessionTimeout.js';

const router = express.Router();

// all user Routes
router.get('/get-all', authentication, sessionTimeout,bookController.getAllBooks);
router.get('/get/:id', authentication, sessionTimeout,bookController.getBookById);
router.get('/search/name', authentication, sessionTimeout,bookController.searchBookByName);

// Admin Only Routes
router.post('/add', authentication, sessionTimeout,isAdmin,upload.single('bookCover'),bookController.addBook);
router.put('/update/:id', authentication, sessionTimeout, isAdmin, upload.single('bookCover'), bookController.updateBookById);
router.delete('/delete/:id', authentication, sessionTimeout,isAdmin, bookController.deleteBookById);

export default router;
