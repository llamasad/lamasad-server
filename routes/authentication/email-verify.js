var express = require('express');
var router = express.Router(); // Initialize Nodemailer transporter

// Route to handle user registration and email verification
var localStore = { tokenStoreVerification: [] };

// Route to handle email verification
router.post('/email-verify', (req, res) => {
    console.log(localStore.tokenStoreVerification);

    const { email, token } = req.body;
    // Retrieve the verification token associated with the user's email
    const storedToken = retrieveVerificationToken(email);
    if (token === storedToken.token) {
        clearTimeout(storedToken.timeOutId);
        localStore.tokenStoreVerification = localStore.tokenStoreVerification.filter((item) => {
            return item.email !== storedToken.email;
        });
        markEmailAsVerified(email);
        res.send('Email verified successfully');
    } else {
        res.status(400).send('Invalid verification token');
    }
});

// Dummy functions for demonstration purposes

function retrieveVerificationToken(email) {
    const element = localStore.tokenStoreVerification.find((element) => {
        return element.email === email;
    });

    if (element) {
        return element;
    } else {
        return null;
    }
}

function markEmailAsVerified(email) {
    // Update the user's email status as verified in the database
}

module.exports = { localStore, router, retrieveVerificationToken };
