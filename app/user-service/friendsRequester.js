import createError from 'http-errors';


async function add_friend(req, reply) {
    const receiver_id = req.query.receiver_id;
    const requester_id = req.params.id;
    console.log(receiver_id, requester_id);
    try {
        this.db.prepare(`INSERT  INTO friendships(userRequester, userReceiver) VALUES(?, ?)`)
               .run([requester_id, receiver_id]);
    }
    catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
            throw createError.Conflict("This record already exists");
        throw err;
    }
    const requester_Data = this.db.prepare(`SELECT id, username, avatar_url, is_read
                                            FROM userInfo
                                            WHERE id = ?`).get([requester_id]);

    this.db.prepare("UPDATE userInfo SET  is_read = FALSE WHERE id = ?")
            .run([requester_Data.id]);

    const notificationSockets = this.sockets.get(receiver_id);

    if (!notificationSockets)
        return ;

    requester_Data.is_read = false;
    requester_Data["type"] = 'SEND_NOTIFICATION'
    console.log(requester_Data)
    for (const socket of notificationSockets) {
        if (socket && socket.readyState == 1)
            socket.send(JSON.stringify(requester_Data));
    }

    reply.code(201).send({ success: true });
}

async function getFriends(req, reply) {
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
    req.log.info("your get friends successfluy")
    return (friends);
}

async function routes(fastify) {
    fastify.put("/user/:id/add-friend", add_friend);
    fastify.get("/user/:id/friends", getFriends);
}

// module.exports = routes;
export default routes;