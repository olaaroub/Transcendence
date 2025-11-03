
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
        const friends = await this.db.all(`SELECT u.id, u.username
                                           FROM `);
        reply.code(200).send(friends);
    }
    catch
    {
        reply.code(200).send({success: false});

    }
}

async function routes(fastify)
{
    fastify.put("users/:id/add-friend", add_friend);
    fastify.get("users/:id/friends", getFriends);
}

module.exports = routes;