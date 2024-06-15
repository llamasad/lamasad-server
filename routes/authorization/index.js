var express = require('express');
var router = express.Router(); // Initialize Nodemaile

const login = require('./login');
const register = require('./register');
const userCheck = require('./user-check');
const auth = require('./auth');

router.use('/', userCheck);
router.use('/', auth);
router.use('/', login);
router.use('/', register);

module.exports = router;
