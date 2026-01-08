async function leaderboardHandler(req, reply) {
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
    // fb1bcb0c-8ce9-417e-b219-e2c0c9398300.jpg
    // users.unshift({
    //     id: 99999,
    //     username: 'lbackend lmhybbbb',
    //     avatar_url: '/public/fb1bcb0c-8ce9-417e-b219-e2c0c9398300.jpg',
    //     Rating: 999999,
    //     GamesPlayed: 999999,
    //     TotalWins: 999999,
    //     TotalLosses: 0,
    //     WinRate: 100
    // })
    // console.log(users)
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
