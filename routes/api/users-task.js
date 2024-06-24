import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.get('/users-task', async function (req, res) {
    const type = req.query.task_id.split('-')[0];
    const task_id = Number(req.query.task_id.split('-')[1]);
    try {
        if (type === 'micro') {
            const userMicroTasks = await prisma.microTaskUser.findMany({ where: { microTask_id: task_id } });
            if (!userMicroTasks.length) {
                return res.json({ data: [] });
            }
            res.json({ data: userMicroTasks });
        } else {
            const userMacroTasks = await prisma.macroTaskUser.findMany({ where: { macroTask_id: task_id } });
            if (!userMacroTasks.length) {
                return res.json({ data: [] });
            }
            res.json({ data: userMacroTasks });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Function to decode JWT token (You need to implement this function)

export default router;
