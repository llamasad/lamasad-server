var express = require('express');
var router = express.Router();
var { Account } = require('../models');
/* GET users listing. */
router.post('/test', function (req, res, next) {
    Account.create({
        email: 'datdo@gmail.@123',
        password: '123123', // Store the hashed password
        _id: '123',
    });
    res.send('respond with a resource');
});

module.exports = router;
