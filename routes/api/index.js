import express from 'express';
import user from './user.js';
import project from './project.js';
import task from './task.js';
import tasks from './tasks.js';
import activity from './activity.js';
import usersTask from './users-task.js';
import activitiesTasksChild from './activities-tasks-child.js';
import history from './history.js';
import users from './users.js';
import userPermission from './user-permission.js';
import fileAttach from './file-attach.js';
import { Account, User } from '../../models/index.js';
import decodeToken from '../../service/jwt-service.js';

const router = express.Router();
const apiRouter = express.Router();

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
export default apiRouter;
