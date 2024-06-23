import express from 'express';
import { FileAttach } from '../../models/index.js';
var router = express.Router();

router.get('/file-attach/:id', async function (req, res) {
    try {
        const activity_id = req.params.id;
        const fileAttach = await FileAttach.findAll({ where: { activity_id: activity_id } });
        res.json(fileAttach);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

export default router;
