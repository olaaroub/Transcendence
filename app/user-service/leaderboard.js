async function leaderboardHandler(req) {
    let start = parseInt(req.query.start);
    let offset = parseInt(req.query.offset);

    if (isNaN(start) || start < 0) {
        start = 0;
    }

    const users = this.db.prepare(`
        SELECT * FROM leaderboardItem
        ORDER BY Rating DESC
        LIMIT ? OFFSET ?
    `).all(offset, start);

    if (start === 0) {
        req.log.info("Leaderboard top 10 accessed");
    }

    return users
}

async function leaderboard(fastify) {
    const schema = {
        schema: {
            querystring: {
                type: 'object',
                required: ['start', 'offset'],
                properties: {
                    start: { type: 'integer' },
                    offset: { type: 'integer' }
                }
            }
        }
    }
    fastify.get('/user/leaderboard', schema ,leaderboardHandler)
}

export default leaderboard;
