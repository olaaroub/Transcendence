
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

async  function statisticRoutes(fastify)  {


    fastify.get("/user/statistic", statisticHandler);
}

module.exports = statisticRoutes;