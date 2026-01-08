import {getFriendsQuery} from './friendsRequester.js';

async function updateFriendOnlineStatus(userId, fastify, type) {
    const friends = await getFriendsQuery(userId, fastify);
    friends.forEach(friend => {
        const friendId = String(friend.id);
        if (fastify.sockets.has(friendId)) {
            const response = JSON.stringify({
                type,
                friend_id: userId
            });
            const friendSockets = fastify.sockets.get(friendId);
            for (const s of friendSockets) {
                if (s.readyState === 1) s.send(response);
            }
        }
    });
}

async function routes(fastify) {

    fastify.get('/user/notification/:id', { websocket: true }, async (socket, req) => {
        const id = req.params.id;

        if (!id) {
            req.log.warn("Websocket connection rejected: No ID provided");
            socket.close(1008, "Policy Violation: ID required");
            return;
        }

        const log = req.log.child({ socketUser: id });
        log.info("Websocket connected");

        try {
            if (!fastify.sockets.has(id)) {
                updateFriendOnlineStatus(id, fastify, 'FRIEND_ONLINE');
                fastify.sockets.set(id, new Set());
                fastify.customMetrics.onlineUsersGauge.inc();
            }
            fastify.sockets.get(id).add(socket);

            socket.on('close', () => {
                const userSockets = fastify.sockets.get(id);
                if (userSockets) {
                    userSockets.delete(socket);
                    if (userSockets.size === 0) {
                        updateFriendOnlineStatus(id, fastify, 'FRIEND_OFFLINE');
                        fastify.sockets.delete(id);
                        fastify.customMetrics.onlineUsersGauge.dec();
                    }
                }
                log.info("Websocket disconnected");
            });

            socket.on('error', (err) => {
                log.error({ err }, "Websocket connection error");
            });

            socket.on('message', async (message) => {
                try {
                    const msgString = message.toString();

                    log.debug({ msg: msgString }, "Received WS message");

                    const data = JSON.parse(msgString);

                    if (data.type === 'MAKE_AS_READ') {
                        fastify.log.debug(`user ${id} make as read`);
                        fastify.db.prepare("UPDATE userInfo SET is_read = TRUE WHERE id = ?").run([id]);

                        const response = JSON.stringify({ type: 'NOTIFICATION_READED' });

                        const notificationSockets = fastify.sockets.get(id);
                        if (notificationSockets) {
                            for (const s of notificationSockets) {
                                log.debug({socketStatus: s.readyState, clientUserId: id}, "socket status");
                                if (s.readyState === 1) s.send(response);
                            }
                        }
                        else
                            log.debug({clientUserId: id}, "user not found to send to them notification")
                    }
                } catch (err) {
                    log.error({ err: err }, "Failed to process websocket message");
                }
            });

        } catch (err) {
            log.error({ err: err }, "Websocket initialization failed");
            socket.close(1011, "Internal Server Error");
        }
    });
}

export default routes;
