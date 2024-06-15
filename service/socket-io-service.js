var { Message } = require('../models');

const ioCallBack = (io) => (socket) => {
    console.log('a user connected');

    socket.on('joinBoxChat', async (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        try {
            const messages = await Message.findAll({
                where: { chat_id: room },
                order: [['created_at', 'DESC']],
                limit: 10,
            });

            // Emit the latest messages to the user who joined the room
            socket.emit('latestMessages', messages.reverse()); // Reverse to send oldest to newest
        } catch (err) {
            console.error('Error retrieving messages:', err);
        }
    });
    socket.on('chatMessage', async (msg) => {
        const room = msg.room;
        const message = {
            message: msg.message,
            user_id: msg.user_id,
            username: msg.username,
            avatar: msg.avatar,
            room: msg.room,
            created_at: new Date(),
        };
        try {
            await Message.create({
                messageText: msg.message,
                user_id: msg.user_id,
                username: msg.username,
                imgSrc: msg.avatar,
                chat_id: msg.room,
            });
        } catch (err) {
            console.error(err);
            return;
        }
        io.to(room).emit('chatMessage', message);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    if (!socket.recovered) {
    }
};
module.exports = ioCallBack;
