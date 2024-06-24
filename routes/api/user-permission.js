import express from 'express';
import prisma from '../../lib/prisma.js';
const router = express.Router();

router.post('/user-permission', async function (req, res) {
    const { task_id, _id: user_id, permission, username, userTag } = req.body;

    console.log(permission, username);
    const type = task_id.split('-')[0];
    const id = Number(task_id.split('-')[1]);
    //create a new user permission
    try {
        if (type === 'macro') {
            const userMacroTasks = await prisma.macroTaskUser.findFirst({
                where: { macroTask_id: id, user_id: user_id },
            });
            if (userMacroTasks) {
                await prisma.macroTaskUser.update({
                    where: { id: userMacroTasks.id },
                    data: { userPermision: permission },
                });
            } else {
                await prisma.macroTaskUser.create({
                    data: { macroTask_id: id, user_id: user_id, userPermision: permission },
                });
                const macroTask = await prisma.macroTask.findUnique({ where: { id: Number(id) } });

                await prisma.historyText.create({
                    data: {
                        history_id: macroTask.history_id,
                        text: `${req.user.username + req.user.userTag} added ${username + userTag} with permission is ${
                            permission == 3 ? 'view and edit' : 'view'
                        }`,
                        entity: [req.user.username, username, 'view', 'and', 'edit'],
                    },
                });
                if (macroTask.microTasks_id) {
                    for (const microTask_id of macroTask.microTasks_id) {
                        await prisma.microTaskUser.create({
                            data: { microTask_id: microTask_id, user_id: user_id, userPermision: permission },
                        });
                    }
                }
                if (macroTask.activities_id) {
                    for (const activity_id of macroTask.activities_id) {
                        await prisma.activityUser.create({
                            data: { activity_id: activity_id, user_id: user_id, userPermision: permission },
                        });
                    }
                }
            }
        } else if (type === 'micro') {
            const userMicroTasks = await prisma.microTaskUser.findFirst({
                where: { microTask_id: id, user_id: user_id },
            });
            if (userMicroTasks) {
                await prisma.microTaskUser.update({
                    where: { id: userMicroTasks.id },
                    data: { userPermision: permission },
                });
            } else {
                await prisma.microTaskUser.create({
                    data: { microTask_id: id, user_id: user_id, userPermision: permission },
                });
                const microTask = await prisma.microTask.findUnique({ where: { id: id } });

                await prisma.historyText.create({
                    data: {
                        history_id: microTask.history_id,
                        text: `${req.user.username + req.user.userTag} added ${username + userTag} with permission is ${
                            permission == 3 ? 'view and edit' : 'view'
                        }`,
                        entity: [req.user.username, username, 'view', 'and', 'edit'],
                    },
                });
                if (microTask.activities_id) {
                    for (const activity_id of microTask.activities_id) {
                        await prisma.activityUser.create({
                            data: { activity_id: activity_id, user_id: user_id, userPermision: permission },
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

export default router;
