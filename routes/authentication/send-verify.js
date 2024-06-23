import express from 'express';
import nodemailer from 'nodemailer';
import { localStore } from './email-verify.js';
import { Account } from '../../models/index.js';
var router = express.Router();
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

router.post('/send-verify', async (req, res) => {
    const email = req.body.email;
    // Generate a verification token (you can use a library like crypto to generate random tokens)\    var account = await Account.findOne({ where: { email: email } });
    var account = await Account.findOne({ where: { email: email } });
    if (!account) {
        if (!retrieveVerificationToken(email)) {
            const verificationToken = generateVerificationToken();
            // Send verification email
            transporter.sendMail(
                {
                    from: '"lamasad" <datdo2712003@gmail.com>',
                    to: email,
                    subject: 'Please verify your email address',
                    html: `<p>code: ${verificationToken} to verify your email address.</p>`,
                },
                (error, info) => {
                    if (error) {
                        res.status(500).send('Error sending verification email');
                    } else {
                        // Save the verification token to associate it with the user
                        saveVerificationToken(email, verificationToken);
                        res.send('Check your email for verification link');
                    }
                },
            );
        } else {
            res.status(409).send('Wait for the previous OTP to expire');
        }
    } else {
        res.status(409).send('Email is exist');
    }
});

function generateVerificationToken() {
    const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber.toString();
}

function saveVerificationToken(email, token) {
    const emailExists = localStore.tokenStoreVerification.find((item) => item.email === email);
    if (!emailExists) {
        let timeOutId = setTimeout(() => {
            localStore.tokenStoreVerification = localStore.tokenStoreVerification.filter((item) => {
                return item.email !== email;
            });
        }, 60000);
        localStore.tokenStoreVerification.push({ email, token, timeOutId });
    }
}
export { router, saveVerificationToken };
