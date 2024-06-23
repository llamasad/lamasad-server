import express from 'express';
var router = express.Router();
/* GET users listing. */
router.get('/captcha-verfity', function (req, res, next) {
    var recaptchaResponse = req.body.recaptchaResponse;
});

export default router;
