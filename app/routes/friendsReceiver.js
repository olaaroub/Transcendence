
/*
    {
        accept: true/false,
        id: 4
    }
    ,i.profileImage
                                INNERE JOIN
                                infos AS i ON f.userReceiver = i.user_id
*/

async function getPendingRequestes(req, reply)
{
    try
    {
        const id = req.params.id
        const data = await this.db.all(`SELECT u.username, u.id
                          FROM
                            users AS u
                            INNER JOIN
                                friendships AS f ON u.id = (
                                    CASE
                                        WHEN userReceiver = ? THEN userRequester
                                    END
                                )
                                WHERE
                                    f.userReceiver = ? AND f.status = 'PENDING'
                        `, [id, id]);
        console.log(data);
        reply.code(200).send(data);

    }
    catch (err) {
        console.log(err);
        reply.code(500).send({"message": "internal server error"});
    }
}

async function handleFriendRequest(req, reply)
{
    try
    {
        const body = req.body;
        const receiver_id = req.params.id;
        console.log(`requester number ${body.id} is ${body.accept}`);
        if (body.accept)
            await this.db.run(`UPDATE friendships SET status = ? WHERE (userReceiver = ? AND userRequester = ?)`, ["ACCEPTED", receiver_id, body.id]);
        else
            await this.db.run(`DELETE FROM friendships WHERE userReceiver = ?`, [body.id]);
        reply.code(200).send({success: true});
    }
    catch
    {
        reply.code(500).send({success: false});
    }
}

async function routes(fastify)
{
    fastify.post("/users/:id/friend-request", handleFriendRequest);
    fastify.get("/users/:id/getPendingRequestes", getPendingRequestes);
}

module.exports = routes;