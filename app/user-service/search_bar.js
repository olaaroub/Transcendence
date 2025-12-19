async function searchBarHandler(req, reply)
{
    const query = req.query.username || "";
    const id = req.params.id;

    const data = this.db.prepare(`
        SELECT u.id, u.username, f.status, u.avatar_url
        FROM userInfo AS u
        LEFT JOIN friendships AS f
            ON u.id = (
                CASE
                    WHEN userRequester = ? THEN userReceiver
                    WHEN userReceiver = ? THEN userRequester
                END
            )
        WHERE LOWER(u.username) LIKE LOWER(?)
        AND (
            f.status IS NULL OR
            f.status != 'BLOCKED' OR
            f.blocker_id = ?
        )
        ORDER BY u.username ASC
        LIMIT 15`)
        .all([id, id, `%${query}%`, id])

        fastify.customMetrics.searchCounter.inc();
        req.log.info({ userId: id, searchQuery: query, resultsCount: data.length }, "User performed a search");

    return data;
}


export default async function search_bar(fastify) {
    fastify.get('/user/search/:id', searchBarHandler);
}
