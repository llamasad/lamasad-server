import express from 'express';
var router = express.Router(); // Initialize Nodemaile

import userCheck from './user-check.js';
import auth from './auth.js';
import login from './login.js';
import register from './register.js';

router.use('/', userCheck);
router.use('/', auth);
router.use('/', login);
router.use('/', register);

export default router;
