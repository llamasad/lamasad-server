import prisma from '../lib/prisma.js';
const ioCallBack = (io) => (socket) => {
    socket.on('joinBoxChat', async (room) => {
        socket.join(room);
        try {
            const messages = await prisma.message.findMany({
                where: { chat_id: room },
                orderBy: { createdAt: 'desc' },
                take: 10,
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
            await prisma.message.create({
                data: {
                    messageText: msg.message,
                    user_id: msg.user_id,
                    username: msg.username,
                    imgSrc: msg.avatar,
                    chat_id: msg.room,
                },
            });
        } catch (err) {
            console.error(err);
            return;
        }
        io.to(room).emit('chatMessage', message);
    });

    socket.on('disconnect', () => {});

    if (!socket.recovered) {
        // Handle any additional logic for new connections
    }
};

export default ioCallBack;
