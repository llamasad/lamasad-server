var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connectStatus = require('./config/db/check-connect');
require('dotenv').config();
var bodyParser = require('body-parser');
var indexRouter = require('./routes');
var usersRouter = require('./routes/users');
var db = require('./config/db');
var cors = require('cors');

var app = express();

var corsOptions = {
    origin: process.env.CLIENT_DOMAIN, // Allow only http://localhost:3000 to access the API
    optionsSuccessStatus: 200, // Respond with 200 for preflight requests
    credentials: true,
};

//midleware cors
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var http = require('http');
var { Server } = require('socket.io');
var ioCallBack = require('./service/socket-io-service');

app.use('/', indexRouter);
app.use('/users', usersRouter);

var server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
    },

    connectionStateRecovery: {},
});
io.on('connection', ioCallBack(io));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = { app, server };
