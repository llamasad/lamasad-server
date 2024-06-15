var express = require('express');
var router = express.Router();

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
router.get('/file-attach/:id', async function (req, res) {
    try {
        const activity_id = req.params.id;
        const fileAttach = await FileAttach.findAll({ where: { activity_id: activity_id } });
        res.json(fileAttach);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

module.exports = router;
