import express from 'express';
import api from './api/index.js';
import author from './authorization/index.js';
import authen from './authentication/index.js';
var router = express.Router();

/* GET home page. */
router.use('/', api);
router.use('/', author);
router.use('/', authen);

export default router;
