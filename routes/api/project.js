import express from 'express';
import prisma from '../../lib/prisma.js';
const router = express.Router();

router.get('/project', async function (req, res) {
    try {
        const projectUsers = await prisma.projectUser.findMany({
            where: { user_id: req.query.user_id },
        });
        const projectIds = projectUsers.map((pu) => pu.project_id);
        if (projectIds.length) {
            const projects = await prisma.project.findMany({
                where: { id: { in: projectIds } },
            });
            res.json({ data: { projects } });
        } else {
            res.json({ data: [] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
