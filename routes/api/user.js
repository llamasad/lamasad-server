var express = require('express');
var router = express.Router();
var { User } = require('../../models');

router.get('/user', async function (req, res) {
    const user = await User.findOne({ where: { account_id: req.bearerToken } });
    res.json(user);
});

// Function to decode JWT token (You need to implement this function)

module.exports = router;
