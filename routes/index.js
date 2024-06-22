var express = require('express');
var router = express.Router();
var author = require('./authorization');
var authen = require('./authentication');
var api = require('./api');
/* GET home page. */
router.use('/', api);
router.use('/', author);
router.use('/', authen);

module.exports = router;
