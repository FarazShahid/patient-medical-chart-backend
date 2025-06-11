const express = require('express');
const router = express.Router();
const { login, registerUser , resetPassword} = require('../controllers/authController');

router.post('/login', login);
router.post('/registerUser', registerUser);
router.patch('/resetPassword', resetPassword);

module.exports = router;