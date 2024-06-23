import express from 'express';
import decodeToken from '../../service/jwt-service.js';
import { User, Account } from '../../models/index.js';
var router = express.Router();

router.get('/user-check', async function (req, res) {
    // Extract the _id from the bearer token

    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
        return res.json({ message: 'custom' });
    }
    const token = bearerToken.split(' ')[1];
    console.log(token);

    try {
        // Decode the token to get the user _id
        const decodedToken = decodeToken(token);

        // Query the database to check if the user exists
        const account = await Account.findOne({ where: { _id: decodedToken._id } });
        if (!account) {
            return res.json({ message: 'custom' });
        }
        const user = await User.findOne({ where: { account_id: decodedToken._id } });
        if (!user) {
            return res.json({ message: 'userNonAuth' });
        }
        console.log(user);
        return res.json({ message: 'user', user: user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Function to decode JWT token (You need to implement this function)

export default router;
