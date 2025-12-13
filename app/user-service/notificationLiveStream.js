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
                fastify.sockets.set(id, new Set());
            }
            fastify.sockets.get(id).add(socket);

            socket.on('close', () => {
                const userSockets = fastify.sockets.get(id);
                if (userSockets) {
                    userSockets.delete(socket);
                    if (userSockets.size === 0) {
                        fastify.sockets.delete(id);
                    }
                }
                log.info("Websocket disconnected");
            });

            socket.on('message', async (message) => {
                try {
                    const msgString = message.toString();

                    log.debug({ msg: msgString }, "Received WS message");

                    const data = JSON.parse(msgString);

                    if (data.type === 'MAKE_AS_READ') {
                        await fastify.db.prepare("UPDATE userInfo SET is_read = TRUE WHERE user_id = ?").run([id]);

                        const response = JSON.stringify({ type: 'NOTIFICATION_READED' });

                        const notificationSockets = fastify.sockets.get(id);
                        if (notificationSockets) {
                            for (const s of notificationSockets) {
                                if (s.readyState === 1) s.send(response);
                            }
                        }
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