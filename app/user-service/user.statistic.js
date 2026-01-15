import createError from 'http-errors';

async function statisticHandler(req, reply) {
    const id = req.params.id;

    const stats = this.db.prepare(`
        SELECT TotalWins, WinRate, MaxStreak, CurrentStreak, Rating
        FROM userInfo
        WHERE id = ?
    `).get(id);

    if (!stats) {
        throw createError.NotFound("User not found");
    }

    req.log.info({ userId: id }, "User statistics fetched");
    return stats;
}

async function statisticRoutes(fastify) {
    fastify.get("/user/statistic/:id", statisticHandler);
}

export default statisticRoutes;
