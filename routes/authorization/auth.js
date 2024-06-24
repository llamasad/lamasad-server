import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import prisma from '../../lib/prisma.js';
import decodeToken from '../../service/jwt-service.js';
import { numberToUserTagCount, increaseUserTagCount, userTagCount } from '../../service/user-tag-count.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/user');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + uuidv4() + '.' + file.mimetype.split('/')[1]);
    },
});
const upload = multer({ storage: storage });

router.post(
    '/auth',
    async function (req, res, next) {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Bearer token missing or invalid' });
        }
        const token = bearerToken.split(' ')[1];

        try {
            const decodedToken = decodeToken(token);
            const account = await prisma.account.findUnique({ where: { id: decodedToken._id } });

            if (!account) {
                return res.status(401).json({ message: 'Access token does not exist' });
            }
            const user = await prisma.user.findUnique({ where: { account_id: decodedToken._id } });
            if (!user) {
                req.decodedToken = decodedToken;
                next();
                return;
            }
            return res.status(401).json({ message: 'User already exists' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    upload.single('avatar'),
    async function (req, res) {
        const account_id = req.decodedToken._id;
        const username = req.body.username;
        const dateOfBirth = req.body.birthday;
        const imgSrc = req.file
            ? `${process.env.DOMAIN}/images/user/${req.file.filename}`
            : `${process.env.DOMAIN}/images/user/avatar-default-1.png`;

        try {
            const userTag = '#' + numberToUserTagCount(++userTagCount.count);
            const user = await prisma.user.create({
                data: {
                    userTag: userTag,
                    imgSrc: imgSrc,
                    account_id: account_id,
                    id: uuidv4(),
                    username: username,
                    dateOfBirth: dateOfBirth,
                },
            });
            if (user) {
                await increaseUserTagCount();
                return res.json({ message: 'User created successfully' });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
);

export default router;
