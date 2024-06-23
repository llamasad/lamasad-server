// Initialize express router
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import decodeToken from '../../service/jwt-service.js';
import { User, UserTagCount, Account } from '../../models/index.js';
import { numberToUserTagCount, increaseUserTagCount } from '../../service/user-tag-count.js';
var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder where files will be stored
        cb(null, './public/images/user');
    },
    filename: function (req, file, cb) {
        // Specify the file name
        cb(null, file.fieldname + '-' + uuidv4() + '.' + file.mimetype.split('/')[1]);
    },
});
var upload = multer({
    storage: storage,
});
router.post(
    '/auth',
    async function (req, res, next) {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Bearer token missing or invalid' });
        }
        const token = bearerToken.split(' ')[1];

        try {
            // Decode the token to get the user _id
            const decodedToken = decodeToken(token);
            // Query the database to check if the user exists
            const account = await Account.findOne({ where: { _id: decodedToken._id } });

            if (!account) {
                return res.status(401).json({ message: 'access tokent not exist' });
            }
            const user = await User.findOne({ where: { account_id: decodedToken._id } });
            if (!user) {
                req.decodedToken = decodedToken;
                next();
                return;
            }
            return res.status(401).json({ message: 'user is exist' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    upload.single('avatar'),
    async function (req, res) {
        var account_id = req.decodedToken._id;
        var username = req.body.username;
        var dateOfBirth = req.body.birthday;
        var imgSrc = req.file
            ? `${process.env.DOMAIN}/images/user/${req.file.filename}`
            : `${process.env.DOMAIN}/images/user/avatar-default-1.png`;

        try {
            const user = await User.create({
                userTag: '#' + numberToUserTagCount(userTagCount.count),
                imgSrc: imgSrc,
                account_id: account_id, // Assuming decodedToken is already processed as required
                _id: uuidv4(),
                username: username,
                dateOfBirth: dateOfBirth,
            });
            if (user) {
                await increaseUserTagCount(UserTagCount);
                return res.json({ message: 'User created successfully' });
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    },
);

// Function to decode JWT token (You need to implement this function)

export default router;
