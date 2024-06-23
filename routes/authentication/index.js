import express from 'express'; // Import express
var router = express.Router(); // Initialize Nodemaile

import { router as emailVerify } from './email-verify.js';
import { router as sendVerifry } from './send-verify.js';

router.use('/', emailVerify);
router.use('/', sendVerifry);

export default router;
