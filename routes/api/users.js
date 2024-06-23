import express from 'express';
import { Op, Sequelize } from 'sequelize';
import { User, MacroTaskUser, MicroTaskUser } from '../../models/index.js';

const router = express.Router();

router.get('/users', async function (req, res) {
    const name = req.query.name;
    const task_id = req.query.task_id.split('-')[1];
    const type = req.query.task_id.split('-')[0];

    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }

    try {
        // Determine the model to use based on the task type
        let UserTaskModel;
        if (type === 'macro') {
            UserTaskModel = MacroTaskUser;
        } else if (type === 'micro') {
            UserTaskModel = MicroTaskUser;
        } else {
            return res.status(400).json({ error: 'Invalid task type' });
        }
        const userTaskTableName = UserTaskModel.getTableName();
        console.log('userTaskTableName:', userTaskTableName);
        // Find users where the name matches and are not in the specified task
        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${name}%`,
                },
                _id: {
                    [Op.notIn]: Sequelize.literal(
                        `(SELECT user_id FROM "${userTaskTableName}" WHERE "${
                            type === 'macro' ? 'macroTask_id' : 'microTask_id'
                        }" = ${task_id})`,
                    ),
                },
            },
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ error: 'An error occurred while searching for users' });
    }
});

export default router;
