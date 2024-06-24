import express from 'express';
import prisma from '../../lib/prisma.js';
const router = express.Router();

router.get('/tasks-activities-child', async function (req, res) {
    try {
        const microsTasks_id = req.query.tasks;
        const activities_id = req.query.activities;
        let microsTasks = [];
        let activities = [];

        if (microsTasks_id) {
            const ids = microsTasks_id.split(',').map((id) => Number(id));
            microsTasks = await prisma.microTask.findMany({
                where: { id: { in: ids } },
            });
        }

        if (activities_id) {
            const ids = activities_id.split(',').map((id) => Number(id));
            activities = await prisma.activity.findMany({
                where: { id: { in: ids } },
            });
        }
        microsTasks = microsTasks.map((task) => ({
            ...task,
            _id: task.id,
        }));
        activities = activities.map((activity) => ({
            ...activity,
            _id: activity.id,
        }));
        res.json({ data: { microsTasks, activities } });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
