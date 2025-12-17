import createError from 'http-errors';

async function statisticHandler(req, reply) {
    const id = req.params.id;

    const stats = this.db.prepare(`
        SELECT TotalWins, WinRate, CurrentStreak, Rating
        FROM userInfo
        WHERE id = ?
    `).get(id);

    if (!stats) {
        throw createError.NotFound("User not found");
    }

    const response = {
        TotalWins: stats.TotalWins || 69,
        WinRate: stats.WinRate || 69.69,
        CurrentStreak: stats.CurrentStreak || 69,
        Rating: stats.Rating || 69,
    };

    req.log.info({ userId: id }, "User statistics fetched");
    return response;
}

async function statisticRoutes(fastify) {
    fastify.get("/user/statistic/:id", statisticHandler);
}

export default statisticRoutes;
