

async function leaderBordHandler(req, reply) {
    let start = parseInt(req.query.start) || 0;
    if (start < 0 || isNaN(start))
        start = 0;
    // this.db.prepare(`UPDATE infos SET points = 10 WHERE id = 5`).run()
    const users = this.db.prepare(`
                                    SELECT * FROM leaderBordItem
                                    ORDER BY points DESC
                                    LIMIT ? OFFSET ?`).all(10, start);
    return users
}

async function leaderBord(fastify) {
    fastify.get('/user/leaderBord', leaderBordHandler)
}

// module.exports = leaderBord;
export default leaderBord;