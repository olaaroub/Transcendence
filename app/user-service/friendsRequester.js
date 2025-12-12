
async function add_friend(req, reply) {
    const receiver_id = req.query.receiver_id;
    const requester_id = req.params.id;
    console.log(receiver_id, requester_id);
    try {
        this.db.prepare(`INSERT  INTO friendships(userRequester, userReceiver) VALUES(?, ?)`).run([requester_id, receiver_id]);
        const requester_Data = this.db.prepare(`SELECT id, username, avatar_url, is_read
                                                FROM userInfo
                                                WHERE id = ?`).get([requester_id]);

        const notificationSockets = this.sockets.get(receiver_id);
        if (!notificationSockets)
            return ;
        requester_Data.is_read = false;
        requester_Data["type"] = 'SEND_NOTIFICATION'
        this.db.prepare("UPDATE userInfo SET  is_read = FALSE WHERE id = ?").run([requester_Data.id]);
        console.log(requester_Data)
        for (const socket of notificationSockets) {
            if (socket && socket.readyState == 1)
                socket.send(JSON.stringify(requester_Data));
        }

        reply.code(201).send({ success: true });
    }
    catch (err) {
        console.log(err)
        reply.code(401).send({ success: false });
    }
}

async function getFriends(req, reply) {
    try {
        const id = req.params.id;
        const friends = this.db.prepare(`SELECT u.id, u.username, u.avatar_url
                                           FROM
                                            userInfo u
                                            INNER JOIN
                                                friendships f ON u.id = (
                                                    CASE
                                                        WHEN f.userRequester = ? THEN f.userReceiver
                                                        WHEN f.userReceiver = ? THEN f.userRequester
                                                    END
                                                )
                                            WHERE
                                                (f.userRequester = ? OR f.userReceiver = ?) AND f.status = 'ACCEPTED'
                                           `).all([id, id, id, id]);
        console.log(friends);
        reply.code(200).send(friends);
    }
    catch (err) {
        console.log(err);
        reply.code(200).send({ success: false });

    }
}

async function routes(fastify) {
    fastify.put("/user/:id/add-friend", add_friend);
    fastify.get("/user/:id/friends", getFriends);
}

// module.exports = routes;
export default routes;