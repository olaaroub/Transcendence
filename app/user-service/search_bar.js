
async function search_bar(fastify) {
    fastify.get('/user/search/:id', async (req, reply) => {
        try {
            const query = req.query.username || "";
            const id = req.params.id;
            const data = await fastify.db.prepare(` SELECT u.user_id, u.username, f.status, u.avatar_url
                                                FROM
                                                    userInfo AS u
                                                    LEFT JOIN friendships AS f
                                                        ON u.user_id = (
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
            
            data.forEach(user => user.id = user.user_id);
            console.log(data);
            reply.code(200).send(data);
        }
        catch (err) {
            console.log(err.message);
            reply.code(500).send({ success: true, message: "can not search" });
        }
    })
}

// module.exports = search_bar;
export default search_bar;