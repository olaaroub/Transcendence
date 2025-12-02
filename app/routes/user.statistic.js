
async function statisticHandler(req, reply)
{
    return {
        TotalWins: 127,
        TotalWeekWin: 12,
        WinRate: 74.7,
        CurrentStreak: 8,
        Rating: 2847
    };
}

async  function statisticRoutes(fastify)
{
    fastify.get("/users/statistic/:id", statisticHandler);
}

// module.exports = statisticRoutes;
export default statisticRoutes;