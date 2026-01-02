import createError from 'http-errors';

async function getPendingRequestes(req, reply) {
    const id = req.params.id
    const data = this.db.prepare(`SELECT u.username, u.id, u.avatar_url
                        FROM
                            userInfo AS u
                        INNER JOIN
                            friendships AS f ON u.id = f.userRequester
                        WHERE
                            f.userReceiver = ? AND f.status = 'PENDING'

        `,).all([id]);

    const { is_read } = this.db.prepare('SELECT is_read FROM userInfo WHERE id = ?').get(id);

    const response = {
        is_read,
        "userFriends": data
    };

    req.log.info({ userId: id, count: response.length }, "Fetched pending friend requests");
    return response;
}

async function handleFriendRequest(req, reply) {
    const body = req.body;
    const receiver_id = req.params.id;

    if (!body.id) {
        throw createError.BadRequest("Sender id is empty");
    }

    if (body.accept) {
        const info = this.db.prepare(`UPDATE friendships SET status = ? WHERE (userReceiver = ? AND userRequester = ?)`)
            .run(["ACCEPTED", receiver_id, body.id]);

        if (info.changes === 0)
            throw createError.NotFound("Friend request not found or already handled");

        req.log.info({ receiverId: receiver_id, senderId: body.id }, "Friend request ACCEPTED");
        this.customMetrics.friendCounter.inc({ action: 'accepted' });
    }
    else {
        const info = this.db.prepare(`DELETE FROM friendships WHERE (userReceiver = ? AND userRequester = ?)`)
            .run([receiver_id, body.id]);

        if (info.changes === 0)
            req.log.warn({ receiverId: receiver_id, senderId: body.id }, "Attempted to reject non existent friend request");
        else
        {
            req.log.info({ receiverId: receiver_id, senderId: body.id }, "Friend request REJECTED");
            this.customMetrics.friendCounter.inc({ action: 'rejected' });
        }
    }

    return { success: true, message: body.accept ? "Request accepted" : "Request rejected" };
}

async function routes(fastify) {
    fastify.post("/user/:id/friend-request", handleFriendRequest);
    fastify.get("/user/:id/getPendingRequestes", getPendingRequestes);
}

export default routes;
