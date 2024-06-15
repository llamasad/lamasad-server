var express = require('express');
var router = express.Router();
var {
    MacroTask,
    MicroTask,
    History,
    Chat,
    MacroTaskUser,
    MicroTaskUser,
    HistoryText,
    User,
    Message,
} = require('../../models');
const { last } = require('lodash');

router.post('/task', async function (req, res) {
    const own_task = req.query.own_task;
    switch (req.body.type) {
        case 'Macro':
            try {
                const history = await History.create({});
                const chat = await Chat.create({});
                const task = await MacroTask.create({
                    ...req.body,
                    history_id: history._id,
                    chat_id: chat._id,
                    status: req.body.status ? req.body.status : 'todo',
                });
                if (task) {
                    await HistoryText.create({
                        text: task.title + ' task created by ' + req.user.username + req.user.userTag,
                        entity: [task.title, req.user.username],
                        history_id: history._id,
                    });
                    //1 read only
                    //2 write only
                    //3 read and write
                    //7 admin
                    await MacroTaskUser.create({ macroTask_id: task._id, user_id: req.user._id, userPermision: '7' });
                    history.macroTask_id = task._id;
                    chat.macroTask_id = task._id;
                    history.save();
                    chat.save();
                    res.json(task);
                }
            } catch (err) {
                console.error(err);
                if (!res.headersSent) {
                    res.status(500).send('Internal Server Error');
                }
            }
            break;

        case 'Micro':
            try {
                const history = await History.create({});
                const chat = await Chat.create({});
                const task = await MicroTask.create({
                    ...req.body,
                    history_id: history._id,
                    chat_id: chat._id,
                    status: req.body.status ? req.body.status : 'todo',
                });
                if (task) {
                    await HistoryText.create({
                        text: task.title + ' task created by ' + req.user.username + req.user.userTag,
                        entity: [task.title, req.user.username],
                        history_id: history._id,
                    });
                    //1 read only
                    //2 write only
                    //3 read and write
                    //7 admin
                    if (own_task) {
                        const ownTask = await MacroTask.findOne({ where: { _id: own_task } });
                        ownTask.microTasks_id = ownTask.microTasks_id
                            ? [...ownTask.microTasks_id, task._id]
                            : [task._id];
                        await ownTask.save();
                        await HistoryText.create({
                            text: req.user.username + req.user.userTag + ': ' + `added ${task.title} task `,
                            entity: [task.title, req.user.username],
                            history_id: ownTask.history_id,
                        });
                        const menbers = await MacroTaskUser.findAll({ where: { macroTask_id: own_task } });
                        for (let i = 0; i < menbers.length; i++) {
                            const menber = menbers[i];

                            await MicroTaskUser.create({
                                microTask_id: task._id,
                                user_id: menber.user_id,
                                userPermision:
                                    menber.dataValues.user_id === req.user._id
                                        ? '7'
                                        : menber.dataValues.userPermision === '7'
                                        ? '3'
                                        : '1',
                            });
                        }

                        history.microTask_id = task._id;
                        chat.microTask_id = task._id;

                        history.save();
                        chat.save();
                        res.json(task);
                    } else {
                        await MicroTaskUser.create({
                            microTask_id: task._id,
                            user_id: req.user._id,
                            userPermision: '7',
                        });
                        history.microTask_id = task._id;
                        chat.microTask_id = task._id;

                        history.save();
                        chat.save();
                        res.json(task);
                    }
                }
            } catch (err) {
                console.error(err);
                console.log('error:', res.headersSent);
                if (!res.headersSent) {
                    res.status(500).send('Internal Server Error');
                }
            }
            break;
        default:
            res.status(400).send('Bad Request');
    }
});

router.get('/task/:id', async function (req, res) {
    //type + taskid example micro-12
    const tt = req.params.id.split('-');
    if (tt.length != 2) {
        res.status(400).send('Bad Request');
    } else if (tt[0] == 'macro') {
        try {
            const macroTaskUser = await MacroTaskUser.findOne({
                where: { macroTask_id: tt[1], user_id: req.user._id },
            });
            if (macroTaskUser) {
                const macroTask = await MacroTask.findOne({ where: { _id: tt[1] } });
                if (macroTask) {
                    res.json({ ...macroTask.dataValues, userPermision: macroTaskUser.userPermision, type: 'macro' });
                } else {
                    res.status(404).send('Not Found');
                }
            } else {
                res.status(404).send('Not Found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else if (tt[0] == 'micro') {
        try {
            const microTaskUser = await MicroTaskUser.findOne({
                where: { microTask_id: tt[1], user_id: req.user._id },
            });
            if (microTaskUser) {
                const microTask = await MicroTask.findOne({ where: { _id: tt[1] } });
                if (microTask) {
                    res.json({ ...microTask.dataValues, userPermision: microTaskUser.userPermision, type: 'micro' });
                } else {
                    res.status(404).send('Not Found');
                }
            } else {
                res.status(404).send('Not Found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Bad Request');
    }
});

router.put('/task/:id', async function (req, res) {
    const tt = req.params.id.split('-');
    const feildName = req.query.name;
    if (tt.length != 2) {
        res.status(400).send('Bad Request');
    } else if (tt[0] == 'macro') {
        try {
            const macroTaskUser = await MacroTaskUser.findOne({
                where: { macroTask_id: tt[1], user_id: req.user._id },
            });
            if (macroTaskUser) {
                const macroTask = await MacroTask.findOne({ where: { _id: tt[1] } });
                if (macroTask) {
                    const lastValue = macroTask[feildName];
                    macroTask[feildName] = req.body.value;
                    await macroTask.save();
                    await HistoryText.create({
                        text:
                            req.user.username +
                            req.user.userTag +
                            ': ' +
                            ` edited the ${feildName} data field from ${lastValue} to ${macroTask[feildName]}`,
                        entity: [feildName, req.user.username],
                        history_id: macroTask.history_id,
                    });
                    res.json({ ...macroTask.dataValues, userPermision: macroTaskUser.userPermision, type: 'macro' });
                } else {
                    res.status(404).send('Not Found');
                }
            } else {
                res.status(404).send('Not Found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else if (tt[0] == 'micro') {
        try {
            const microTaskUser = await MicroTaskUser.findOne({
                where: { microTask_id: tt[1], user_id: req.user._id },
            });
            if ((microTaskUser && microTaskUser.userPermision === '7') || microTaskUser.userPermision === '3') {
                const microTask = await MicroTask.findOne({ where: { _id: tt[1] } });
                if (microTask) {
                    const lastValue = microTask[feildName];
                    microTask[feildName] = req.body.value;
                    await microTask.save();
                    await HistoryText.create({
                        text:
                            req.user.username +
                            req.user.userTag +
                            ': ' +
                            ` edited the ${feildName} data field from ${lastValue} to ${microTask[feildName]}`,
                        entity: [feildName, req.user.username],
                        history_id: microTask.history_id,
                    });
                    res.json({ ...microTask.dataValues, userPermision: microTaskUser.userPermision, type: 'micro' });
                } else {
                    res.status(404).send('Not Found');
                }
            } else {
                res.status(404).send('Not Found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Bad Request');
    }
});

router.delete('/task/:id', async function (req, res) {
    const tt = req.params.id.split('-');
    if (tt.length != 2) {
        return res.status(400).send('Bad Request');
    }

    const taskId = tt[1];
    const taskType = tt[0];

    try {
        if (taskType === 'macro') {
            const macroTaskUser = await MacroTaskUser.findOne({
                where: { macroTask_id: taskId, user_id: req.user._id },
            });

            if (macroTaskUser && macroTaskUser.userPermision === '7') {
                const macroTask = await MacroTask.findOne({ where: { _id: taskId } });

                if (macroTask) {
                    // Delete associated HistoryText and Chat entries
                    await HistoryText.destroy({ where: { history_id: macroTask.history_id } });
                    await History.destroy({ where: { _id: macroTask.history_id } });
                    await Chat.destroy({ where: { _id: macroTask.chat_id } });
                    await MacroTaskUser.destroy({ where: { macroTask_id: taskId } });

                    const microTasks = await MicroTask.findAll({ where: { macroTask_id: taskId } });
                    for (const microTask of microTasks) {
                        await HistoryText.destroy({ where: { history_id: microTask.history_id } });
                        await History.destroy({ where: { _id: microTask.history_id } });
                        await Message.destroy({ where: { chat_id: microTask.chat_id } });
                        await Chat.destroy({ where: { _id: microTask.chat_id } });
                        await MicroTaskUser.destroy({ where: { microTask_id: microTask._id } });
                        await microTask.destroy();
                    }

                    await macroTask.destroy();
                    return res.status(204).send();
                } else {
                    return res.status(404).send('Not Found');
                }
            } else {
                return res.status(403).send('Forbidden');
            }
        } else if (taskType === 'micro') {
            const microTaskUser = await MicroTaskUser.findOne({
                where: { microTask_id: taskId, user_id: req.user._id },
            });

            if (microTaskUser && microTaskUser.userPermision === '7') {
                const microTask = await MicroTask.findOne({ where: { _id: taskId } });

                if (microTask) {
                    // Delete associated HistoryText and Chat entries
                    await HistoryText.destroy({ where: { history_id: microTask.history_id } });
                    await History.destroy({ where: { _id: microTask.history_id } });
                    await Message.destroy({ where: { chat_id: microTask.chat_id } });
                    await Chat.destroy({ where: { _id: microTask.chat_id } });
                    await MicroTaskUser.destroy({ where: { microTask_id: taskId } });

                    await microTask.destroy();
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

module.exports = router;
