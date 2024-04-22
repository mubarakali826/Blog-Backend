const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const message = require('../helpers/message');

router.post('/signup', signup);
router.post('/login', login);

router.use((req, res) => {
  message.sendErrorResponse(res, 400, 'Invalid Endpoint');
});

module.exports = router;
