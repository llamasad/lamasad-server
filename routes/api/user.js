import express from 'express';
import { User } from '../../models/index.js';

const router = express.Router();

router.get('/user', async function (req, res) {
    const user = await User.findOne({ where: { account_id: req.bearerToken } });
    res.json(user);
});

// Function to decode JWT token (You need to implement this function)

export default router;
