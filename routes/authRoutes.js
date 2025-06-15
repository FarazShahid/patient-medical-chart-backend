const express = require('express');
const router = express.Router();
const { login, registerUser , resetPassword} = require('../controllers/authController');
const checkAdmin = require('../middlewares/checkAmdin');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/registerUser', authMiddleware,checkAdmin,registerUser);
router.patch('/resetPassword', resetPassword);

module.exports = router;