
async function search_bar(fastify)
{
    fastify.get(`/users/search`, async  (req, reply) => {
        const query = req.query.username || "";
        const data = await fastify.db.all(`SELECT users.id, users.username, infos.profileImage
                                           FROM users
                                           INNER JOIN infos ON users.id = infos.user_id
                                           WHERE LOWER(users.username) LIKE LOWER(?)
                                           ORDER BY users.username ASC
                                           LIMIT 15`,[`%${query}%`]);
        reply.code(200).send(data);
    })
    fastify.get('/users/search/:id', async (req, reply) => {
        try {
            const query = req.query.username || "";
            const id = req.params.id;
            const data = await fastify.db.all(` SELECT u.id, u.username, f.status, i.profileImage
                                                FROM
                                                    users AS u
                                                    INNER JOIN
                                                        infos AS i
                                                        ON 
                                                            u.id = i.user_id 
                                                    LEFT JOIN friendships AS f
                                                        ON i.user_id = (
                                                            CASE
                                                                WHEN userRequester = ? THEN userReceiver
                                                                WHEN userReceiver = ? THEN userRequester
                                                            END
                                                        )
                                                    WHERE LOWER(u.username) LIKE LOWER(?)
                                                    ORDER BY u.username ASC
                                                    LIMIT 15
        `, [id, id, `%${query}%`])
        reply.code(200).send(data);
        }
        catch (err) {
            console.log(err.message);
            reply.code(500).send({success: true, message: "can not search"});
        }
    })
}

module.exports = search_bar;