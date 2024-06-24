import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import indexRouter from './routes/index.js'; // Ensure the file path is correct
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import ioCallBack from './service/socket-io-service.js'; // Ensure the file path is correct
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { init } from './service/user-tag-count.js';

// Convert the URL to a directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const corsOptions = {
    origin: process.env.CLIENT_URL, // Allow only http://localhost:3000 to access the API
    optionsSuccessStatus: 200, // Respond with 200 for preflight requests
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
app.set('view engine', 'ejs');

init();
// Middleware cors
app.use(cors(corsOptions));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {},
});

io.on('connection', ioCallBack(io));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.json({ error: err.message });
});

export { app, server };
