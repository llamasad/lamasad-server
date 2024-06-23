import express from 'express';
var router = express.Router();
import { HistoryText } from '../../models/index.js';

router.get('/history', async function (req, res) {
    const history_id = req.query.id;
    try {
        const history = await HistoryText.findAll({ where: { history_id: history_id } });
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
        const history = await HistoryText.create({ ...req.body });
        res.json({ data: history });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Function to decode JWT token (You need to implement this function)

export default router;
