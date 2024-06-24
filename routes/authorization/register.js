import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma.js';

const router = express.Router();
const saltRounds = 10;

router.post('/register', async function (req, res, next) {
    const { email, password } = req.body;

    try {
        // Check if the email already exists in the database
        const existingAccount = await prisma.account.findUnique({ where: { email } });
        if (existingAccount) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new account
        const newAccount = await prisma.account.create({
            data: {
                email,
                password: hashedPassword,
                id: uuidv4(),
            },
        });

        // Create a JWT token
        const token = jwt.sign({ _id: newAccount.id }, process.env.SECRET_TOKEN);

        // Set the token as a cookie on the client
        res.cookie('access-token', token, {
            httpOnly: true, // Recommended to prevent access from client-side scripts
            secure: true, // Ensure cookie is sent over HTTPS
            sameSite: 'None', // Allow cookie to be sent in cross-site requests
            path: '/', // Makes the cookie available across the entire domain
            maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration (30 days)
        });

        res.json({ message: 'Account created successfully', accessToken: token });
    } catch (err) {
        console.error('Error during registration:', err);
        next(err);
    }
});

export default router;
