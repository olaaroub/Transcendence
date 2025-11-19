
async function search_bar(fastify)
{
    fastify.get('/users/search/:id', async (req, reply) => {
        try {
            const query = req.query.username || "";
            const id = req.params.id;
            const data = await fastify.db.all(` SELECT u.id, u.username, f.status, u.profileImage
                                                FROM
                                                    users AS u
                                                    LEFT JOIN friendships AS f
                                                        ON u.id = (
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