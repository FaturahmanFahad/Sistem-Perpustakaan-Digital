const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Public routes (Admins & Users can access)
router.get('/', BookController.getAllBooks);
router.get('/recommendations', BookController.getRecommendations);
router.get('/:id', BookController.getBookById);

// Protected routes (Admin only)
router.post('/', verifyToken, isAdmin, BookController.createBook);
router.put('/:id', verifyToken, isAdmin, BookController.updateBook);
router.delete('/:id', verifyToken, isAdmin, BookController.deleteBook);

module.exports = router;
