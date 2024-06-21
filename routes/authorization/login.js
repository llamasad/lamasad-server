var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var { Account } = require('../../models');
const bcrypt = require('bcrypt');
var axios = require('axios');

router.post('/login', async function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var recaptchaResponse = req.body.recaptchaResponse;
    try {
        const response = await axios.get('https://www.google.com/recaptcha/api/siteverify', {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaResponse,
            },
        });
        if (!response.data.success) {
            // The reCAPTCHA was not verified successfully. Send an error response
            res.status(400).json({ message: 'reCAPTCHA verification failed' });
            return;
        }

        // The reCAPTCHA was verified successfully. Continue with registration...
        // ...
    } catch (error) {
        // Handle any errors that occurred while verifying the reCAPTCHA
        next(error);
    }

    // Find the user in the database
    var account = await Account.findOne({ where: { email: email } });
    if (!account) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, account.password);
    // If account not found or password doesn't match
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If credentials are valid, create a JWT
    var token = jwt.sign({ _id: account._id }, process.env.SECRET_TOKEN);

    // Set the token as a cookie on the client
    res.cookie('access-token', token, {
        httpOnly: true, // Recommended to prevent access from client-side scripts
        secure: true, // Ensure cookie is sent over HTTPS
        sameSite: 'None', // Allow cookie to be sent in cross-site requests
        path: '/', // Makes the cookie available across the entire domain
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration (30 days)
    });

    // Send success response
    res.json({ message: 'Login successful' });
});

module.exports = router;
