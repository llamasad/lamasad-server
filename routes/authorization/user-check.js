import express from 'express';
import decodeToken from '../../service/jwt-service.js';
import prisma from '../../lib/prisma.js';
var router = express.Router();

router.get('/user-check', async function (req, res) {
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
        return res.json({ message: 'custom' });
    }
    const token = bearerToken.split(' ')[1];
    try {
        const decodedToken = decodeToken(token);

        const account = await prisma.account.findUnique({ where: { id: decodedToken._id } });
        if (!account) {
            return res.json({ message: 'custom' });
        }
        const user = await prisma.user.findUnique({ where: { account_id: decodedToken._id } });
        if (!user) {
            return res.json({ message: 'userNonAuth' });
        }
        return res.json({ message: 'user', user: { ...user, _id: user.id } });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
