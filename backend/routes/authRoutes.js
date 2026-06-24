const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Route for registration
router.post('/register', AuthController.register);

// Route for login
router.post('/login', AuthController.login);

module.exports = router;
