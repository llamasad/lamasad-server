import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma.js';
import { __dirname } from '../../app.js';
// Convert the URL to a directory name

var router = express.Router();
router.post('/activity', async function (req, res) {
    try {
        var [task_type, task_id] = req.query.task_id.split('-');
        task_id = Number(task_id);
        const history = await prisma.history.create({});
        const chat = await prisma.chat.create({});
        const activity = await prisma.activity.create({
            data: {
                ...req.body,
                status: 'incomplete',
                history_id: history.id,
                chat_id: chat.id,
            },
        });

        await prisma.historyText.create({
            data: {
                text: `${activity.title} activity created by ${req.user.username} ${req.user.userTag}`,
                entity: [activity.title, req.user.username],
                history_id: history.id,
            },
        });

        if (activity) {
            if (task_type == 'micro') {
                const task = await prisma.microTask.findUnique({
                    where: { id: task_id },
                });
                task.activities_id = task.activities_id ? [...task.activities_id, activity.id] : [activity.id];
                await prisma.microTask.update({
                    where: { id: task_id },
                    data: { activities_id: task.activities_id },
                });

                await prisma.historyText.create({
                    data: {
                        text: `${req.user.username}${req.user.userTag}: added ${activity.title} activity`,
                        entity: [activity.title, req.user.username],
                        history_id: task.history_id,
                    },
                });

                const usersMicro = await prisma.microTaskUser.findMany({
                    where: { microTask_id: task_id },
                });

                for (const user of usersMicro) {
                    await prisma.activityUser.create({
                        data: {
                            activity_id: activity.id,
                            user_id: user.user_id,
                            userPermision: user.user_id === req.user.id ? '7' : user.userPermision === '7' ? '3' : '1',
                        },
                    });
                }

                await prisma.history.update({
                    where: { id: history.id },
                    data: { activity_id: activity.id },
                });

                await prisma.chat.update({
                    where: { id: chat.id },
                    data: { activity_id: activity.id },
                });
            } else if (task_type == 'macro') {
                const task = await prisma.macroTask.findUnique({
                    where: { id: task_id },
                });

                task.activities_id = task.activities_id ? [...task.activities_id, activity.id] : [activity.id];

                await prisma.macroTask.update({
                    where: { id: task_id },
                    data: { activities_id: task.activities_id },
                });

                await prisma.historyText.create({
                    data: {
                        text: `${req.user.username}${req.user.userTag}: added ${activity.title} activity`,
                        entity: [activity.title, req.user.username],
                        history_id: task.history_id,
                    },
                });

                const usersMacro = await prisma.macroTaskUser.findMany({
                    where: { macroTask_id: task_id },
                });

                for (const user of usersMacro) {
                    await prisma.activityUser.create({
                        data: {
                            activity_id: activity.id,
                            user_id: user.user_id,
                            userPermision: user.user_id === req.user.id ? '7' : user.userPermision === '7' ? '3' : '1',
                        },
                    });
                }

                await prisma.history.update({
                    where: { id: history.id },
                    data: { activity_id: activity.id },
                });

                await prisma.chat.update({
                    where: { id: chat.id },
                    data: { activity_id: activity.id },
                });
            }
            return res.json({ ...activity, _id: activity.id });
        } else {
            throw new Error('Activity creation failed');
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder where files will be stored
        const dir = path.join(__dirname, './public/files');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Specify the file name
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /docx|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: File upload only supports the following filetypes - ' + fileTypes));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.put('/activity/:id', upload.array('addFile'), async function (req, res) {
    try {
        const files = req.files;
        const title = req.body.title;
        const request = req.body.request;
        const limits = req.body.limits;
        const removeFile = JSON.parse(req.body.removeFile);
        const filesStats = JSON.parse(req.body.files);
        const activity = await prisma.activity.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (removeFile.length > 0) {
            for (let i = 0; i < removeFile.length; i++) {
                const file = await prisma.fileAttach.findUnique({
                    where: { id: Number(removeFile[i]) },
                });
                if (file) {
                    const filename = file.name.split('/|\\');
                    const filePath = path.join(__dirname, '../../public/files', filename[filename.length - 1]);
                    fs.unlinkSync(filePath);
                    activity.fileAttach_id = activity.fileAttach_id.filter((item) => item !== Number(removeFile[i]));
                    await prisma.activity.update({
                        where: { id: activity.id },
                        data: { fileAttach_id: activity.fileAttach_id },
                    });
                    await prisma.fileAttach.delete({
                        where: { id: Number(removeFile[i]) },
                    });
                }
            }
        }

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const fileAttach = await prisma.fileAttach.create({
                    data: {
                        name: filesStats[i].name + '/|\\' + files[i].filename,
                        src: `${process.env.DOMAIN}/files/${files[i].filename}`,
                        weight: filesStats[i].weight,
                        type: filesStats[i].type,
                        activity_id: Number(req.params.id),
                    },
                });
                activity.fileAttach_id = activity.fileAttach_id
                    ? [...activity.fileAttach_id, fileAttach.id]
                    : [fileAttach.id];
            }
        }
        await prisma.activity.update({
            where: { id: activity.id },
            data: {
                title: title,
                request: request,
                limits: limits,
                fileAttach_id: activity.fileAttach_id,
            },
        });

        res.status(200).json({ message: 'put success uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
