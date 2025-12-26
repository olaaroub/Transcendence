const ext = process.env.SERVICE_EXT || '-prod';
const USER_SERVICE_URL = `http://user-service${ext}:3002`;

async function addSocketAndUserInfos(socket, fastify, userId) {
    if (!fastify.sockets.has(userId)) {
        const isFoundedInDataBase = fastify.db.prepare("SELECT 1 FROM usersCash WHERE id = ?").get(userId);

        if (!isFoundedInDataBase) {
            const userData = await fetch(`${USER_SERVICE_URL}/api/user/chat/profile/${userId}`);

            if (!userData.ok)
                throw new Error("Failed to fetch user info from User Service");

            const { username, avatar_url } = await userData.json();
            fastify.db.prepare('INSERT INTO usersCash(id, username, avatar_url) VALUES(?, ?, ?)')
                .run(userId, username, avatar_url);
            fastify.log.info("fetch the user Infos successfly");
        }
        fastify.sockets.set(userId, new Set())
    }
    fastify.sockets.get(userId).add(socket);
}

function deletSocket(socket, fastify, userId) {
    const userSockets = fastify.sockets.get(userId);
    if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
            fastify.sockets.delete(userId);
        }
    }
    fastify.log.info("socket closed - client disconnected");
}



async function handleMessageEvent(socket, fastify, userId, message) {
    try {
    const messageAsString = message.toString();
    const messageJson = JSON.parse(messageAsString);

    if (!messageJson.msg || typeof messageJson.msg !== 'string' || messageJson.msg.trim() === '')
        throw new Error("Message content is required");

    const messageBody = fastify.db.prepare("INSERT INTO messages(sender_id, msg) VALUES(?, ?) RETURNING sender_id, msg, created_at")
        .get(userId, messageJson.msg);

    const userData = fastify.db.prepare('SELECT * FROM usersCash WHERE id = ?').get(userId);

    socket.send(JSON.stringify({
        type: 'MESSAGE_SENT_SUCCESSFULLY'
    }));

    fastify.log.info({ userId, message: messageJson.msg }, "User sent a message");

    const response = {
        messageBody,
        username: userData.username,
        avatar_url: userData.avatar_url
    }

    const sockets = fastify.sockets;
    sockets.forEach((userSockets, user_id) => {
        userSockets.forEach(userSocket => {
            if (userSocket !== socket)
                userSocket.send(JSON.stringify(response));
        })
    });
    } catch (err) {
        fastify.log.error({ err, userId }, "Error handling message event");
        socket.send(JSON.stringify({
            type: 'MESSAGE_SEND_FAILURE',
            error: err.message || 'Internal Server Error'
        }));
    }
}

export async function globalChatHandler(socket, request) {
    const id = request.params.id;

    try {
        await addSocketAndUserInfos(socket, request.server, id);

        socket.on('close', () => deletSocket(socket, request.server, id));
        socket.on('error', (err) => request.log.error({ err }, "Websocket connection error"))
        socket.on('message', async (message) => await handleMessageEvent(socket, request.server, id, message));
    } catch (err) {
        request.log.error(err);
        socket.close();
    }
}