import express from 'express';
import { MicroTaskUser, MacroTaskUser } from '../../models/index.js';

const router = express.Router();

router.get('/users-task', async function (req, res) {
    console.log(req.query.task_id);
    const type = req.query.task_id.split('-')[0];
    const task_id = req.query.task_id.split('-')[1];
    try {
        if (type === 'micro') {
            const userMicroTasks = await MicroTaskUser.findAll({ where: { microTask_id: task_id } });
            if (!userMicroTasks) {
                return res.json({ data: [] });
            }
            res.json({ data: userMicroTasks });
        } else {
            const userMacroTasks = await MacroTaskUser.findAll({ where: { macroTask_id: task_id } });
            if (!userMacroTasks) {
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
