var express = require('express');
var router = express.Router(); // Initialize Nodemaile

const emailVerify = require('./email-verify');
const sendVerifry = require('./send-verify');

router.use('/', emailVerify.router);
router.use('/', sendVerifry);

module.exports = router;
