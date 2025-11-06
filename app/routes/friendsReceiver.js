
/*
    {
        accept: true/false,
        id: 4
    }
*/

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
}

module.exports = routes;