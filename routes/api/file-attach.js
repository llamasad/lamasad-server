import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.get('/file-attach/:id', async function (req, res) {
    try {
        const activity_id = Number(req.params.id);
        const fileAttach = await prisma.fileAttach.findMany({
            where: { activity_id: activity_id },
        });
        res.json(fileAttach.map((file) => ({ ...file, _id: file.id })));
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

export default router;
