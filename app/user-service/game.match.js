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
    this.db.function('calculateWinRate', () => {});

    const insertValues = (player) => {
        let stmt;
        if (player.win)
        {
            stmt = this.db.prepare(`UPDATE userInfo SET
                                                    GamesPlayed = GamesPlayed + 1,
                                                    TotalWins = TotalWins + 1,
                                                    GoalsScored = GoalsScored + ?,
                                                    CurrentStreak = CurrentStreak + 1,
                                                    MaxStreak = MaxValue(MaxStreak, CurrentStreak)
                                                WHERE id = ?`);
        }
        else
        {
            stmt =  this.db.prepare(`UPDATE userInfo SET
                                                    GamesPlayed = GamesPlayed + 1,
                                                    TotalLosses = TotalLosses + 1,
                                                    GoalsTaken = GoalsTaken + ?,
                                                    CurrentStreak = 0
                                                WHERE id = ?`);
        }
        return stmt

    }
    const runQury = this.db.transaction(() => {
        insertValues(p1).run(p1.scored, p1.userID);
        insertValues(p2).run(p2.scored, p2.userID)
    });
    runQury();
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
    fastify.put("/api/user/match/result", {schema: matchSchema}, matchDataController);
}