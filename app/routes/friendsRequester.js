const { default: fastify } = require("fastify");
const { ERROR } = require("sqlite3");

async function add_friend(req, reply)
{
    const receiver_id = req.query.receiver_id;
    const requester_id = req.params.id;

    try
    {
        const socketsa = this.sockets.get(receiver_id);
        if  (!socketsa)
            throw ERROR  ("socket Not found")
        await this.db.run(`INSERT  INTO friendships(userRequester, userReceiver) VALUES(?, ?)`, [requester_id, receiver_id]);
        const requester_Data = await this.db.get(`SELECT u.id, u.username, u.profileImage, i.is_read FROM 
                                                users u
                                                INNER JOIN  infos i ON u.id = i.user_id
                                                WHERE u.id = ?`, [requester_id]);
                                        
        console.log(requester_Data)
        requester_Data.is_read = false;
        await this.db.run("UPDATE infos SET  is_read = FALSE WHERE user_id = ?", [requester_Data.id]);
        console.log("socket size: ", socketsa.size);
        for (let i = 0; i < socketsa.size; i++)
        {
            if (socketsa[i] && socketsa[i].readyState == 1)
                socketsa[i].send(JSON.stringify(requester_Data));
        }

        reply.code(201).send({success: true});
    }
    catch (err)
    {
        console.log(err)
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