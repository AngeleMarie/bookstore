import express from 'express';
import bookController from '../controllers/bookControllers.js';
import authentication from '../middlewares/authMiddleware.js';
import isAdmin from "../middlewares/isAdmin.js";
import upload from '../middlewares/uploadMiddleware.js';
import sessionTimeout from '../middlewares/sessionTimeout.js';

const router = express.Router();

// all user Routes
router.get('/books', authentication, sessionTimeout,bookController.getAllBooks);

router.get('/books/:id', authentication, sessionTimeout,bookController.getBookById);
router.get('/books/search/name', authentication, sessionTimeout,bookController.searchBookByName);

// Admin Only Routes
router.post('/books', authentication, sessionTimeout,isAdmin,upload.single('bookCover'),bookController.addBook);

router.put('/books/:id', authentication, sessionTimeout,isAdmin, bookController.updateBookById);
router.delete('/books/:id', authentication, sessionTimeout,isAdmin, bookController.deleteBookById);

export default router;
