import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.get('/user', async function (req, res) {
    const user = await prisma.user.findUnique({ where: { account_id: req.bearerToken } });
    res.json({ ...user, _id: user.id });
});

// Function to decode JWT token (You need to implement this function)

export default router;
