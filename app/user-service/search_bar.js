
async function search_bar(fastify) {
    fastify.get('/user/search/:id', async (req, reply) => {
        const query = req.query.username || "";
        const id = req.params.id;
        const data = fastify.db.prepare(` SELECT u.id, u.username, f.status, u.avatar_url
                                            FROM
                                                userInfo AS u
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
            
            // console.log(data);
        req.log.info(data, `the user number ${id} search for ${query} and this is the resulet: `)
        return data;
    })
}

// module.exports = search_bar;
export default search_bar;