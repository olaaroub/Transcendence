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

/*
    the equation to calculateRating is :
        EA​=1+10(RB​−RA​)/4001​
        EB = 1 - EA
        RA′​=RA​+K⋅(SA​−EA​)
        RB′​=RB​+K⋅(SB−EB​)

*/
function calculateRating(p1CurrentRating, p2CurrentRating, p1win)
{
    const p1ExpectedScore = 1 + Math.pow(10, (p1CurrentRating - p2CurrentRating) / 400);
    const p2ExpectedScore = 1 - p1ExpectedScore;

    const p2win = 1 - p1win;
    const kFactor = 32;

    const p1Rating = Math.round(p1CurrentRating + kFactor * (p1win - p1ExpectedScore));
    const p2Rating = Math.round(p2CurrentRating + kFactor * (p2win - p2ExpectedScore));

    const res = {
        p1Rating: (p1Rating <= 0) ? 0 : p1Rating,
        p2Rating: (p2Rating <= 0) ? 0 : p2Rating
    }
    return res;
}




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
                                                WHERE id = ? RETURNING Rating`);
        }
        else
        {
            stmt =  this.db.prepare(`UPDATE userInfo SET
                                                    GamesPlayed = GamesPlayed + 1,
                                                    TotalLosses = TotalLosses + 1,
                                                    GoalsTaken = GoalsTaken + ?,
                                                    CurrentStreak = 0,
                                                    WinRate = calculateWinRate(TotalWins, GamesPlayed + 1)
                                                WHERE id = ? RETURNING Rating`);
        }
        return stmt

    }
    const runQury = this.db.transaction(() => {
        const p1Rating = insertValues(p1).get(p1.scored, p1.userID);
        const p2Rating = insertValues(p2).get(p2.scored, p2.userID);
        if (!p1Rating || !p2Rating)
            throw createError.NotFound("this users not found to change it!");

        const Rating = calculateRating(p1Rating.Rating , p2Rating.Rating, p1.win)
        console.log(Rating);
        const stmt = this.db.prepare(`UPDATE userInfo SET Rating = ? WHERE id = ?`);
    
        const p1Changes = stmt.run(Rating.p1Rating, p1.userID);
        const p2Changes = stmt.run(Rating.p2Rating, p2.userID);
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