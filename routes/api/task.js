import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

router.post('/task', async function (req, res) {
    const own_task = Number(req.query.own_task);
    const { type, ...taskData } = req.body;
    const createTaskAndRelatedData = async (taskType, taskData) => {
        const history = await prisma.history.create({});
        const chat = await prisma.chat.create({});
        const task = await prisma[taskType].create({
            data: {
                title: taskData.title,
                startTime: taskData.startTime,
                endTime: taskData.endTime,
                history_id: history.id,
                chat_id: chat.id,
                status: taskData.status || 'todo',
            },
        });
        return { history, chat, task };
    };

    const createHistoryText = async (task, historyId, user) => {
        await prisma.historyText.create({
            data: {
                text: `${task.title} task created by ${user.username}${user.userTag}`,
                entity: [task.title, user.username],
                history_id: historyId,
            },
        });
    };

    const createTaskUser = async (taskType, taskId, userId) => {
        const userPermision = '7';
        await prisma[`${taskType}TaskUser`].create({
            data: { [`${taskType}Task_id`]: taskId, user_id: userId, userPermision },
        });
    };

    try {
        const user = req.user;
        if (type === 'Macro') {
            const { history, chat, task } = await createTaskAndRelatedData('macroTask', taskData);
            await createHistoryText(task, history.id, user);
            await createTaskUser('macro', task.id, user.id);
            await prisma.history.update({ where: { id: history.id }, data: { macroTask_id: task.id } });
            await prisma.chat.update({ where: { id: chat.id }, data: { macroTask_id: task.id } });
            return res.json({ task, _id: task.id });
        } else if (type === 'Micro') {
            const { history, chat, task } = await createTaskAndRelatedData('microTask', taskData);
            await createHistoryText(task, history.id, user);

            if (own_task) {
                const micro = await prisma.microTask.update({
                    data: { limits: taskData.limits },
                    where: { id: task.id },
                });
                const ownTask = await prisma.macroTask.findUnique({ where: { id: own_task } });
                await prisma.macroTask.update({
                    where: { id: own_task },
                    data: { microTasks_id: { push: task.id } },
                });
                await createHistoryText(task, ownTask.history_id, user);

                const members = await prisma.macroTaskUser.findMany({ where: { macroTask_id: own_task } });
                for (const member of members) {
                    const userPermision = member.user_id === user.id ? '7' : member.userPermision === '7' ? '3' : '1';
                    await prisma.microTaskUser.create({
                        data: { microTask_id: task.id, user_id: member.user_id, userPermision },
                    });
                }
            } else {
                await createTaskUser('micro', task.id, user.id);
            }

            await prisma.history.update({ where: { id: history.id }, data: { microTask_id: task.id } });
            await prisma.chat.update({ where: { id: chat.id }, data: { microTask_id: task.id } });

            return res.json({ task, _id: task.id });
        } else {
            return res.status(400).send('Bad Request');
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});
router.get('/task/:id', async function (req, res) {
    const tt = req.params.id.split('-');
    if (tt.length !== 2) {
        return res.status(400).send('Bad Request');
    }

    const taskType = tt[0];
    const taskId = Number(tt[1]);

    try {
        if (taskType === 'macro') {
            const macroTaskUser = await prisma.macroTaskUser.findUnique({
                where: { user_id_macroTask_id: { macroTask_id: taskId, user_id: req.user.id } },
            });
            if (macroTaskUser) {
                const macroTask = await prisma.macroTask.findUnique({ where: { id: taskId } });
                if (macroTask) {
                    return res.json({
                        ...macroTask,
                        userPermision: macroTaskUser.userPermision,
                        type: 'macro',
                        _id: macroTask.id,
                    });
                }
            }
        } else if (taskType === 'micro') {
            const microTaskUser = await prisma.microTaskUser.findUnique({
                where: {
                    user_id_microTask_id: {
                        user_id: req.user.id,
                        microTask_id: taskId,
                    },
                },
            });
            if (microTaskUser) {
                const microTask = await prisma.microTask.findUnique({ where: { id: taskId } });
                if (microTask) {
                    return res.json({
                        ...microTask,
                        userPermision: microTaskUser.userPermision,
                        type: 'micro',
                        _id: microTask.id,
                    });
                }
            }
        }
        return res.status(404).send('Not Found');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.put('/task/:id', async function (req, res) {
    const tt = req.params.id.split('-');
    const feildName = req.query.name;
    if (tt.length !== 2) {
        return res.status(400).send('Bad Request');
    }

    const taskType = tt[0];
    const taskId = parseInt(tt[1], 10);

    try {
        if (taskType === 'macro') {
            const macroTaskUser = await prisma.macroTaskUser.findUnique({
                where: { user_id_macroTask_id: { macroTask_id: taskId, user_id: req.user.id } },
            });
            if (macroTaskUser) {
                const macroTask = await prisma.macroTask.findUnique({ where: { id: taskId } });
                if (macroTask) {
                    const lastValue = macroTask[feildName];
                    const updatedTask = await prisma.macroTask.update({
                        where: { id: taskId },
                        data: { [feildName]: req.body.value },
                    });
                    await prisma.historyText.create({
                        data: {
                            text: `${req.user.username}${req.user.userTag}: edited the ${feildName} data field from ${lastValue} to ${updatedTask[feildName]}`,
                            entity: [feildName, req.user.username],
                            history_id: macroTask.history_id,
                        },
                    });
                    return res.json({ ...updatedTask, userPermision: macroTaskUser.userPermision, type: 'macro' });
                }
            }
        } else if (taskType === 'micro') {
            const microTaskUser = await prisma.microTaskUser.findUnique({
                where: { user_id_microTask_id: { microTask_id: taskId, user_id: req.user.id } },
            });
            if (microTaskUser && (microTaskUser.userPermision === '7' || microTaskUser.userPermision === '3')) {
                const microTask = await prisma.microTask.findUnique({ where: { id: taskId } });
                if (microTask) {
                    const lastValue = microTask[feildName];
                    const updatedTask = await prisma.microTask.update({
                        where: { id: taskId },
                        data: { [feildName]: req.body.value },
                    });
                    await prisma.historyText.create({
                        data: {
                            text: `${req.user.username}${req.user.userTag}: edited the ${feildName} data field from ${lastValue} to ${updatedTask[feildName]}`,
                            entity: [feildName, req.user.username],
                            history_id: microTask.history_id,
                        },
                    });
                    return res.json({ ...updatedTask, userPermision: microTaskUser.userPermision, type: 'micro' });
                }
            }
        }
        return res.status(404).send('Not Found');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.delete('/task/:id', async function (req, res) {
    const tt = req.params.id.split('-');
    if (tt.length !== 2) {
        return res.status(400).send('Bad Request');
    }

    const taskId = Number(tt[1]);
    const taskType = tt[0];

    try {
        if (taskType === 'macro') {
            const macroTaskUser = await prisma.macroTaskUser.findFirst({
                where: {
                    macroTask_id: taskId,
                    user_id: req.user._id,
                },
            });

            if (macroTaskUser && macroTaskUser.userPermision === '7') {
                const macroTask = await prisma.macroTask.findUnique({
                    where: { id: taskId },
                });

                if (macroTask) {
                    // Delete associated HistoryText and Chat entries
                    await prisma.historyText.deleteMany({ where: { history_id: macroTask.history_id } });
                    await prisma.history.delete({ where: { id: macroTask.history_id } });
                    await prisma.message.deleteMany({ where: { chat_id: macroTask.chat_id } });
                    await prisma.chat.delete({ where: { id: macroTask.chat_id } });
                    await prisma.macroTaskUser.deleteMany({ where: { macroTask_id: taskId } });

                    await prisma.macroTask.delete({ where: { id: taskId } });
                    return res.status(204).send();
                } else {
                    return res.status(404).send('Not Found');
                }
            } else {
                return res.status(403).send('Forbidden');
            }
        } else if (taskType === 'micro') {
            const microTaskUser = await prisma.microTaskUser.findFirst({
                where: {
                    microTask_id: taskId,
                    user_id: req.user._id,
                },
            });

            if (microTaskUser && microTaskUser.userPermision === '7') {
                const microTask = await prisma.microTask.findUnique({
                    where: { id: taskId },
                });

                if (microTask) {
                    // Delete associated HistoryText and Chat entries
                    await prisma.historyText.deleteMany({ where: { history_id: microTask.history_id } });
                    await prisma.history.delete({ where: { id: microTask.history_id } });
                    await prisma.message.deleteMany({ where: { chat_id: microTask.chat_id } });
                    await prisma.chat.delete({ where: { id: microTask.chat_id } });
                    await prisma.microTaskUser.deleteMany({ where: { microTask_id: taskId } });

                    await prisma.microTask.delete({ where: { id: taskId } });
                    return res.status(204).send();
                } else {
                    return res.status(404).send('Not Found');
                }
            } else {
                return res.status(403).send('Forbidden');
            }
        } else {
            return res.status(400).send('Bad Request');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

export default router;
