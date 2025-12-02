

async function leaderBordHandler(req, reply)
{
    try
    {
        let start = parseInt(req.query.start) || 0;
        if (start < 0 || isNaN(start))
            start = 0;
        // this.db.prepare(`UPDATE infos SET points = 10 WHERE user_id = 5`).run()
        const users = this.db.prepare(` 
                                        SELECT * FROM leaderBordItem
                                        ORDER BY points DESC
                                        LIMIT ? OFFSET ?`).all(10, start);
        reply.code(200).send(users);
    }
    catch (err) {
        console.log(err);
        reply.code(500).send({error: "intrnal server Error"});
    }
}

async function leaderBord(fastify)
{
    fastify.get('/users/leaderBord', leaderBordHandler)
}

module.exports = leaderBord;