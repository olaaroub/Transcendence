import createError from 'http-errors';

/*
interface Player
{
    userID: string;
    win:    boolean;
    scored: number;
}

{
    "player1": {
        userID: string
        win: boolean
        scored: number
    }
    "player2": {
        ...
    }
}
*/


async function matchDataController(req, reply)
{
    const p1 = req.body.p1;
    const p2 = req.body.p2;

    // const updateStreak = (streak) =>

    this.db.function('MaxValue', (num1, num2) => num1 > num2 ? num1 : num2)
    this.db.function('calculateWinRate', (totalWins, gamesPlayed) =>  (totalWins / gamesPlayed) * 100);

    const insertValues = (player) => {
        let stmt;
        if (player.win)
        {
            stmt = this.db.prepare(`UPDATE userInfo SET
                                                    GamesPlayed = GamesPlayed + 1,
                                                    TotalWins = TotalWins + 1,
                                                    GoalsScored = GoalsScored + ?,
                                                    MaxStreak = MaxValue(MaxStreak, CurrentStreak + 1),
                                                    CurrentStreak = CurrentStreak + 1,
                                                    WinRate = calculateWinRate(TotalWins + 1, GamesPlayed + 1)
                                                WHERE id = ?`);
        }
        else
        {
            stmt =  this.db.prepare(`UPDATE userInfo SET
                                                    GamesPlayed = GamesPlayed + 1,
                                                    TotalLosses = TotalLosses + 1,
                                                    GoalsTaken = GoalsTaken + ?,
                                                    CurrentStreak = 0,
                                                    WinRate = calculateWinRate(TotalWins, GamesPlayed + 1)
                                                WHERE id = ?`);
        }
        return stmt

    }
    const runQury = this.db.transaction(() => {
        const p1Changes = insertValues(p1).run(p1.scored, p1.userID);
        const p2Changes = insertValues(p2).run(p2.scored, p2.userID);
        if (p1Changes.changes === 0 || p2Changes.changes === 0)
            throw createError.NotFound("this users not found to change it!");
        const insertMatch = this.db.prepare(`INSERT INTO matchHistory (player1_id, player2_id, player1_score, player2_score)
                                            VALUES (?, ?, ?, ?)`);
        insertMatch.run(p1.userID, p2.userID, p1.scored, p2.scored);
    });
    runQury();

    req.log.info({p1ID: p1.userID, p2ID: p2.userID}, "Match result recorded successfully");
    return { success: true, message: "Match result recorded successfully" };
}

export default function gameEndPoints(fastify)
{
    const playerSchema = {
        type: "object",
        required: ["userID", "win", "scored"],
        properties: {
            userID: {type: "number"},
            win: {type: "boolean"},
            scored: {type: "number"},
        }
    }
    const matchSchema = {
        body: {
            type: "object",
            required: ["p1", "p2"],
            properties: {
                p1: playerSchema,
                p2: playerSchema
            }
        }
    }
    fastify.put("/user/match/result", {schema: matchSchema}, matchDataController);
}