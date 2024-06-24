import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from '../../lib/prisma.js';
const router = express.Router();

router.post('/login', async function (req, res, next) {
    const { email, password, recaptchaResponse } = req.body;

    try {
        const response = await axios.get('https://www.google.com/recaptcha/api/siteverify', {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaResponse,
            },
        });

        if (!response.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        const account = await prisma.account.findUnique({ where: { email } });

        if (!account) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, account.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: account.id }, process.env.SECRET_TOKEN);

        res.cookie('access-token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: 'Login successful', accessToken: token });
    } catch (error) {
        console.error('Error during login:', error);
        next(error);
    }
});

export default router;
