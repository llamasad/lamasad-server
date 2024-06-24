import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.get('/history', async function (req, res) {
    const history_id = Number(req.query.id);
    try {
        const history = await prisma.historyText.findMany({
            where: { history_id: history_id },
        });
        if (!history) {
            return res.json({ data: [] });
        }
        res.json({
            data: history.map((item) => ({
                historyAction: item.text,
                entity: item.entity,
                timeRelease: item.createdAt,
            })),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/history', async function (req, res) {
    try {
        const history = await prisma.historyText.create({
            data: {
                ...req.body,
            },
        });
        res.json({ data: history });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
