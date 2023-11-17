const express = require('express');
const controller = require('../controllers/users.controllers');
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword); 
router.post('/reset-password/:token', controller.resetPassword);


router.get('/register', (req, res) => {
    return res.render('register');
});

router.get('/login', (req, res) => {
    return res.render('login');
});

router.get('/forgot-password', (req, res) => {
    return res.render('forgot-password');
});
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('reset-password', { token });
  });
  
module.exports = router;
