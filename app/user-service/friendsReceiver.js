
/*
    {
        accept: true/false,
        id: 4
    }


    SELECT u.id, u.username, f.status, i.profileImage
    FROM
        users AS u
        INNER JOIN
            infos AS i
            ON
                u.id = i.id
        LEFT JOIN friendships AS f
            ON i.id = (
                CASE
                    WHEN userRequester = 1 THEN userReceiver
                    WHEN userReceiver = 1 THEN userRequester
                END
            )
        WHERE LOWER(u.username) LIKE LOWER('%am%')
*/
// 2
async function getPendingRequestes(req, reply) {
    try {
        const id = req.params.id
        const data = this.db.prepare(`SELECT u.username, u.id, u.avatar_url, u.is_read
                          FROM
                            userInfo AS u
                            INNER JOIN
                                friendships AS f ON u.id = f.userRequester
                            WHERE
                                f.userReceiver = ? AND f.status = 'PENDING'
                        `,).all([id]);
        reply.code(200).send(data);

    }
    catch (err) {
        console.log(err);
        reply.code(500).send({ message: "internal server error" });
    }
}

async function handleFriendRequest(req, reply) {
    try {
        const body = req.body;
        const receiver_id = req.params.id;
        console.log(`requester number ${body.id} is ${body.accept}`);
        if (body.accept)
            await this.db.prepare(`UPDATE friendships SET status = ? WHERE (userReceiver = ? AND userRequester = ?)`).run(["ACCEPTED", receiver_id, body.id]);
        else
            await this.db.prepare(`DELETE FROM friendships WHERE (userReceiver = ? AND userRequester = ?)`).run([receiver_id, body.id]);
        reply.code(200).send({ success: true });
    }
    catch {
        reply.code(500).send({ success: false });
    }
}

async function routes(fastify) {
    fastify.post("/user/:id/friend-request", handleFriendRequest);
    fastify.get("/user/:id/getPendingRequestes", getPendingRequestes);
}

// module.exports = routes;
export default routes;


/*
 /api/users/:id/friend-request -> to accept or refese amie;
 Body be like:
 {
    accept: true/false,
    id: the requester id (hadak li sift lik talab sada9a)
 }
*/