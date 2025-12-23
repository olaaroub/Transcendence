async function leaderBordHandler(req, reply) {
    let start = parseInt(req.query.start);

    if (isNaN(start) || start < 0) {
        start = 0;
    }

    const users = this.db.prepare(`
        SELECT * FROM leaderBordItem
        ORDER BY points DESC
        LIMIT ? OFFSET ?
    `).all(10, start);

    if (start === 0) {
        req.log.info("Leaderboard top 10 accessed");
    }

    return users
}

async function leaderBord(fastify) {
    fastify.get('/user/leaderBord', leaderBordHandler)
}

export default leaderBord;
