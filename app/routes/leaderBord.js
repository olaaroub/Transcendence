

async function leaderBordHandler(req, reply)
{
    let start = parseInt(req.query.start) || 0;
    if (start < 0 || isNaN(start))
        start = 0;
    const users = this.db.prepare(`SELECT u.id, u.username, u.profileImage`);
}

async function leaderBord(fastify)
{
    fastify.get('/users/leaderBord', leaderBordHandler)
}

module.exports = leaderBord;