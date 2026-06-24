const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    // Register User
    static async register(req, res, next) {
        try {
            const { username, email, password, role } = req.body;

            // Form Validation (Backend)
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, dan password wajib diisi.'
                });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar.'
                });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Set role (default to 'user' if not defined or if user attempts to force admin without permission)
            // For simplicity, we allow role creation but default to 'user'
            const finalRole = role === 'admin' ? 'admin' : 'user';

            // Save user to DB
            const userId = await User.create(username, email, hashedPassword, finalRole);

            return res.status(201).json({
                success: true,
                message: 'Registrasi berhasil.',
                data: {
                    id: userId,
                    username,
                    email,
                    role: finalRole
                }
            });
        } catch (error) {
            // Forward error to Global Error Handler Middleware
            next(error);
        }
    }

    // Login User
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Form Validation (Backend)
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password wajib diisi.'
                });
            }

            // Check if user exists
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email atau password salah.'
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Email atau password salah.'
                });
            }

            // Generate JWT Token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'supersecretkey12345',
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login berhasil.',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
