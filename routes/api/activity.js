var express = require('express');
var router = express.Router();
var multer = require('multer');
var uuidv4 = require('uuid').v4;
var path = require('path'); // Import path module
var fs = require('fs');
var {
    ActivityUser,
    Activity,
    History,
    Chat,
    MacroTaskUser,
    MicroTaskUser,
    MicroTask,
    MacroTask,
    HistoryText,
    FileAttach,
} = require('../../models');
const { type } = require('os');
router.post('/activity', async function (req, res) {
    try {
        const [task_type, task_id] = req.query.task_id.split('-');
        const history = await History.create({});
        const chat = await Chat.create({});
        const activity = await Activity.create({
            ...req.body,
            status: 'incomplete',
            history_id: history._id,
            chat_id: chat._id,
        });
        await HistoryText.create({
            text: activity.dataValues.title + ' activity created by ' + req.user.username + req.user.userTag,
            entity: [activity.dataValues.title, req.user.username],
            history_id: history._id,
        });
        if (activity) {
            if (task_type == 'micro') {
                const task = await MicroTask.findOne({ where: { _id: task_id } });
                task.activities_id = task.dataValues.activities_id
                    ? [...task.dataValues.activities_id, activity._id]
                    : [activity._id];
                await task.save();
                await HistoryText.create({
                    text: req.user.username + req.user.userTag + ': ' + `added ${activity.dataValues.title} activity `,
                    entity: [activity.dataValues.title, req.user.username],
                    history_id: task.dataValues.history_id,
                });
                const usersMicro = await MicroTaskUser.findAll({ where: { microTask_id: task_id } });
                for (const user of usersMicro) {
                    await ActivityUser.create({
                        activity_id: activity._id,
                        user_id: user.user_id,
                        userPermision: user.user_id === req.user._id ? '7' : user.userPermision === '7' ? '3' : '1',
                    });
                }

                history.activity_id = activity._id;
                chat.activity_id = activity._id;
                await history.save();
                await chat.save();
            } else if (task_type == 'macro') {
                const task = await MacroTask.findOne({ where: { _id: task_id } });
                task.activities_id = task.dataValues.activities_id
                    ? [...task.dataValues.activities_id, activity._id]
                    : [activity._id];
                await task.save();
                await HistoryText.create({
                    text: req.user.username + req.user.userTag + ': ' + `added ${activity.dataValues.title} activity `,
                    entity: [activity.dataValues.title, req.user.username],
                    history_id: task.dataValues.history_id,
                });
                const usersMacro = await MacroTaskUser.findAll({ where: { macroTask_id: task_id } });
                for (const user of usersMacro) {
                    await ActivityUser.create({
                        activity_id: activity._id,
                        user_id: user.user_id,
                        userPermision:
                            user.dataValues.user_id === req.user._id
                                ? '7'
                                : user.dataValues.userPermision === '7'
                                ? '3'
                                : '1',
                    });
                }

                history.activity_id = activity._id;
                chat.activity_id = activity._id;
                await history.save();
                await chat.save();
            }
            return res.json(activity);
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
        const dir = path.join(__dirname, '../../public/files');
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
        // Other form fields
        const title = req.body.title;
        const request = req.body.request;
        const limits = req.body.limits;
        const removeFile = JSON.parse(req.body.removeFile);
        const filesStats = JSON.parse(req.body.files);
        const activity = await Activity.findOne({ where: { _id: req.params.id } });
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (removeFile.length > 0) {
            for (let i = 0; i < removeFile.length; i++) {
                const file = await FileAttach.findOne({ where: { _id: removeFile[i] } });
                if (file) {
                    const filename = file.name.split('/|\\');
                    const filePath = path.join(__dirname, '../../public/files', filename[filename.length - 1]);
                    fs.unlinkSync(filePath);
                    activity.activities_id =
                        activity.fileAttach_id && activity.fileAttach_id.filter((item) => item !== removeFile[i]);
                    await activity.save();
                    await file.destroy();
                }
            }
        }

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const fileAttach = await FileAttach.create({
                    name: filesStats[i].name + '/|\\' + files[i].filename,
                    src: `${process.env.DOMAIN}/files/${files[i].filename}`,
                    weight: filesStats[i].weight,
                    type: filesStats[i].type,
                    activity_id: req.params.id,
                });
                activity.fileAttach_id = activity.fileAttach_id
                    ? [...activity.fileAttach_id, fileAttach._id]
                    : [fileAttach._id];
            }
        }
        console.log(title, request, limits, activity, 'example');
        activity.title = title;
        activity.request = request;
        activity.limits = limits;
        await activity.save();
        // Implement logic to process the files and other data here

        res.status(200).json({ message: 'put success uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
