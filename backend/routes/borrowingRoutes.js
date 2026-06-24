const express = require('express');
const router = express.Router();
const BorrowingController = require('../controllers/borrowingController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Protected routes (Logged in users)
router.post('/borrow', verifyToken, BorrowingController.borrowBook);
router.post('/return/:id', verifyToken, BorrowingController.returnBook);
router.get('/my', verifyToken, BorrowingController.getMyBorrowings);
router.get('/stats', verifyToken, BorrowingController.getLibraryStats);

// Admin-only route to view all borrowings
router.get('/all', verifyToken, isAdmin, BorrowingController.getAllBorrowings);

module.exports = router;
