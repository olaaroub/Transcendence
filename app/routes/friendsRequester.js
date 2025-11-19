
async function add_friend(req, reply)
{
    const receiver_id = req.query.receiver_id;
    const requester_id = req.params.id;

    try
    {
        await this.db.run(`INSERT  INTO friendships(userRequester, userReceiver) VALUES(?, ?)`, [requester_id, receiver_id]);
        reply.code(201).send({success: true});
    }
    catch
    {
        reply.code(401).send({success: false});
    }
}

async function getFriends(req, reply)
{
    try
    {
        const id = req.params.id;
        const friends = await this.db.all(`SELECT u.id, u.username, u.profileImage
                                           FROM
                                            users u
                                            INNER JOIN 
                                                friendships f ON u.id = (
                                                    CASE
                                                        WHEN f.userRequester = ? THEN f.userReceiver
                                                        WHEN f.userReceiver = ? THEN f.userRequester
                                                    END
                                                )
                                            WHERE
                                                (f.userRequester = ? OR f.userReceiver = ?) AND f.status = 'ACCEPTED'
                                           `, [id, id, id, id]);
        console.log(friends);
        reply.code(200).send(friends);
    }
    catch (err)
    {
        console.log(err);
        reply.code(200).send({success: false});

    }
}

async function routes(fastify)
{
    fastify.put("/users/:id/add-friend", add_friend);
    fastify.get("/users/:id/friends", getFriends);
}

module.exports = routes;