var express = require('express');
var router = express.Router(); // Initialize Nodemaile
var apiRouter = express.Router();
var user = require('./user');
var project = require('./project');
var task = require('./task');
var tasks = require('./tasks');
var activity = require('./activity');
var usersTask = require('./users-task');
var activitiesTasksChild = require('./activities-tasks-child');
var history = require('./history');
var users = require('./users');
var userPermission = require('./user-permission');
var fileAttach = require('./file-attach');
var { Account, User } = require('../../models');

const decodeToken = require('../../service/jwt-service');

router.use('/', activity);

router.use('/', project);

router.use('/', user);

router.use('/', task);

router.use('/', tasks);

router.use('/', usersTask);

router.use('/', activitiesTasksChild);

router.use('/', history);

router.use('/', users);

router.use('/', fileAttach);

router.use('/', userPermission);

apiRouter.use(
    '/api',
    async (req, res, next) => {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return res.status(403).json({ message: 'no access' });
        }
        const token = bearerToken.split(' ')[1];
        try {
            // Decode the token to get the user _id
            const decodedToken = decodeToken(token);
            // Query the database to check if the user exists
            const account = await Account.findOne({ where: { _id: decodedToken._id } });

            if (!account) {
                return res.status(403).json({ message: 'no access' });
            }
            const user = await User.findOne({ where: { account_id: decodedToken._id } });
            if (user) {
                req.bearerToken = decodedToken._id;
                req.user = user;
                next();
                return;
            }
            return res.status(401).json({ message: 'Your account has not been auth step' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    router,
);
module.exports = apiRouter;
