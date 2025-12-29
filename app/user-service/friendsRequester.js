import createError from 'http-errors';

async function add_friend(req, reply) {
    const receiver_id = req.query.receiver_id;
    const requester_id = req.params.id;

    if (!receiver_id)
        throw createError.BadRequest("Reciever ID (friend_id) is required");

    try {
        this.db.prepare(`INSERT  INTO friendships(userRequester, userReceiver) VALUES(?, ?)`)
            .run([requester_id, receiver_id]);
            
        this.customMetrics.friendCounter.inc({ action: 'sent' });
    }
    catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
            throw createError.Conflict("Friend request already sent or you are already friends");
        throw err;
    }

    const requester_Data = this.db.prepare(`SELECT id, username, avatar_url, is_read
                                            FROM userInfo
                                            WHERE id = ?`).get([requester_id]);

    if (!requester_Data) {// khona ms7 profile fach sifti lih request
        throw createError.NotFound("Requester profile not found");
    }

    this.db.prepare("UPDATE userInfo SET  is_read = FALSE WHERE id = ?")
        .run([receiver_id.id]);

    if (this.sockets) {
        const notificationSockets = this.sockets.get(receiver_id);
        if (notificationSockets) {
            // requester_Data.is_read = false;
            requester_Data["type"] = 'SEND_NOTIFICATION';

            req.log.debug({ receiverId: receiver_id }, "Sending friend request notification");

            for (const socket of notificationSockets) {
                if (socket && socket.readyState == 1)
                    socket.send(JSON.stringify(requester_Data));
            }
        }
    }

    req.log.info({ requesterId: requester_id, receiverId: receiver_id }, "Friend request sent successfully");
    reply.code(201).send({ success: true, message: "Friend request sent" });
}

export async function getFriendsQuery(id, fastify) 
{
    return fastify.db.prepare(`SELECT u.id, u.username, u.avatar_url
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
}

async function getFriends(req, reply) {
    const id = req.params.id;
    // const friends = this.db.prepare(`SELECT u.id, u.username, u.avatar_url
    //                                 FROM
    //                                     userInfo u
    //                                 INNER JOIN
    //                                         friendships f ON u.id = (
    //                                             CASE
    //                                                 WHEN f.userRequester = ? THEN f.userReceiver
    //                                                 WHEN f.userReceiver = ? THEN f.userRequester
    //                                             END
    //                                         )
    //                                 WHERE
    //                                     (f.userRequester = ? OR f.userReceiver = ?) AND f.status = 'ACCEPTED'
    //                                        `).all([id, id, id, id]);
    const friends = await getFriendsQuery(id, this);
    friends.forEach((friendData) => {
        const userId = String(friendData.id);

        if (this.sockets.has(userId)) {
            friendData["status"] = "ONLINE";
        } else {
            friendData["status"] = "OFFLINE";
        }
        console.log(friendData)
    });
    req.log.info({ userId: id, count: friends.length }, "Fetched friend list");
    return (friends);
}

async function routes(fastify) {
    fastify.put("/user/:id/add-friend", add_friend);
    fastify.get("/user/:id/friends", getFriends);
}

export default routes;
