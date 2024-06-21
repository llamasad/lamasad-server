var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var { Account } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const saltRounds = 10;

router.post('/register', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    // Check if the username already exists in the database
    Account.findOne({ where: { email: email } })
        .then((account) => {
            if (account) {
                // If the username already exists, send an error response
                res.status(400).json({ message: 'Username already exists' });
            } else {
                // If the username doesn't exist, hash the password and create a new account
                bcrypt.hash(password, saltRounds, function (err, hash) {
                    if (err) {
                        next('hash error' + err);
                    } else {
                        Account.create({
                            email: email,
                            password: hash, // Store the hashed password
                            _id: uuidv4(),
                        })
                            .then((newAccount) => {
                                var token = jwt.sign({ _id: newAccount.dataValues._id }, process.env.SECRET_TOKEN);
                                res.cookie('access-token', token, {
                                    httpOnly: false, // Recommended to prevent access from client-side scripts
                                    secure: true, // Ensure cookie is sent over HTTPS
                                    sameSite: 'None', // Allow cookie to be sent in cross-site requests
                                    path: '/', // Makes the cookie available across the entire domain
                                    maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration (30 days)
                                });

                                res.json({ message: 'Account created successfully' });
                            })
                            .catch((err) => {
                                next(err);
                            });
                    }
                });
            }
        })
        .catch((err) => {
            // Handle any errors that occurred while checking for the username
            next('do ngu' + err);
        });
});

module.exports = router;
