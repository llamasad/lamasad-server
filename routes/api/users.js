import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.get('/users', async function (req, res) {
    const name = req.query.name;
    const task_id = Number(req.query.task_id.split('-')[1]);
    const type = req.query.task_id.split('-')[0];

    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }

    try {
        // Determine the model to use based on the task type
        let userTaskModel;
        if (type === 'macro') {
            userTaskModel = prisma.macroTaskUser;
        } else if (type === 'micro') {
            userTaskModel = prisma.microTaskUser;
        } else {
            return res.status(400).json({ error: 'Invalid task type' });
        }

        // Find users where the name matches and are not in the specified task
        const userTasks = await userTaskModel.findMany({
            where: {
                [type === 'macro' ? 'macroTask_id' : 'microTask_id']: task_id,
            },
            select: {
                user_id: true,
            },
        });
        const userIds = userTasks.map((task) => task.user_id);

        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: name,
                },
                id: {
                    notIn: userIds,
                },
            },
        });
        console.log(users);
        res.json(users.map((user) => ({ ...user, _id: user.id })));
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ error: 'An error occurred while searching for users' });
    }
});

export default router;
