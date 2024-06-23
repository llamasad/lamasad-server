import express from 'express';
import { MicroTask, Activity } from '../../models/index.js';
var router = express.Router();

router.get('/tasks-activities-child', async function (req, res) {
    try {
        const microsTasks_id = req.query.tasks;
        const activites_id = req.query.activities;
        var microsTasks = [];
        var activites = [];
        if (microsTasks_id) {
            microsTasks = await MicroTask.findAll({ where: { _id: microsTasks_id.split(',') } });
        }
        if (activites_id) {
            activites = await Activity.findAll({ where: { _id: activites_id.split(',') } });
        }
        res.json({ data: { microsTasks, activites } });

        // Fetch MacroTasks and MicroTasks for the given user_id
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
