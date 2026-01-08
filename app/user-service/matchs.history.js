
async function matchHistoryHandler(req, reply) {
    const userId = req.userId || req.params.id;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const matchs = this.db.prepare(`SELECT mh.id AS match_id, mh.player1_id, mh.player2_id, mh.player1_score, mh.player2_score, mh.match_date,
                                    u.username AS player1_username, u2.username AS player2_username,
                                    u.avatar_url AS player1_avatar, u2.avatar_url AS player2_avatar
                                    FROM
                                        matchHistory mh JOIN userInfo u ON mh.player1_id = u.id
                                        JOIN userInfo u2 ON mh.player2_id = u2.id
                                    WHERE mh.player1_id = ? OR mh.player2_id = ?
                                    ORDER BY mh.match_date DESC
                                    LIMIT ? OFFSET ?
    `).all(userId, userId, limit, offset);
    req.log.info({ userId: userId, count: matchs.length }, "Fetched match history");

    matchs.push(  {
        "match_id": 1,
        "player1_id": 1,
        "player2_id": 2,
        "player1_score": 4,
        "player2_score": 2,
        "match_date": "2026-01-03 20:28:04",
        "player1_username": "oussama",
        "player2_username": "oussamaHammou",
        "player1_avatar": "/public/default_pfp.png",
        "player2_avatar": "/public/default_pfp.png"
    })
    matchs.push(  {
        "match_id": 1,
        "player1_id": 1,
        "player2_id": 2,
        "player1_score": 4,
        "player2_score": 2,
        "match_date": "2026-01-03 20:28:04",
        "player1_username": "oussama",
        "player2_username": "oussamaHammou",
        "player1_avatar": "/public/default_pfp.png",
        "player2_avatar": "/public/default_pfp.png"
    })
    return matchs;
}

export default async function routes(fastify) {
    fastify.get('/user/:id/match-history', matchHistoryHandler);
}