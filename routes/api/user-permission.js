var express = require('express');
var router = express.Router();
var { User, MacroTaskUser, MacroTask, MicroTask, MicroTaskUser, ActivityUser, HistoryText } = require('../../models');

router.post('/user-permission', async function (req, res) {
    const { task_id, _id: user_id, permission, username, userTag } = req.body;
    const type = task_id.split('-')[0];
    const id = task_id.split('-')[1];
    //create a new user permission
    try {
        if (type === 'macro') {
            const userMacroTasks = await MacroTaskUser.findOne({ where: { macroTask_id: id, user_id: user_id } });
            if (userMacroTasks) {
                userMacroTasks.permission = permission;
                await userMacroTasks.save();
            } else {
                await MacroTaskUser.create({ macroTask_id: id, user_id: user_id, permission: permission });
                HistoryText.create({
                    text: `${req.user._id + req.user.userTag} added ${username + userTag} with permission is ${
                        permission == 3 ? 'view and edit' : 'view'
                    }`,
                    entity: [req.user._id, username, 'view', 'and', 'edit'],
                });
                const macroTask = await MacroTask.findOne({ where: { _id: id } });
                if (macroTask.microTasks_id) {
                    for (const microTask_id of macroTask.microTasks_id) {
                        await MicroTaskUser.create({
                            microTask_id: microTask_id,
                            user_id: user_id,
                            permission: permission,
                        });
                    }
                }
                if (macroTask.activities_id) {
                    for (const activity_id of macroTask.activities_id) {
                        await ActivityUser.create({
                            activity_id: activity_id,
                            user_id: user_id,
                            permission: permission,
                        });
                    }
                }
            }
        } else if (type === 'micro') {
            const userMicroTasks = await MicroTaskUser.findOne({ where: { microTask_id: id, user_id: user_id } });
            if (userMicroTasks) {
                userMicroTasks.permission = permission;
                await userMicroTasks.save();
            } else {
                await MicroTaskUser.create({ microTask_id: id, user_id: user_id, permission: permission });
                HistoryText.create({
                    text: `${req.user._id + req.user.userTag} added ${username + userTag} with permission is ${
                        permission == 3 ? 'view and edit' : 'view'
                    }`,
                    entity: [req.user._id, username, 'view', 'and', 'edit'],
                });
                const microTask = await MicroTask.findOne({ where: { _id: id } });
                if (microTask.activities_id) {
                    for (const activity_id of microTask.activities_id) {
                        await ActivityUser.create({
                            activity_id: activity_id,
                            user_id: user_id,
                            permission: permission,
                        });
                    }
                }
            }
        }
        res.json('User permission updated successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to decode JWT token (You need to implement this function)

module.exports = router;
