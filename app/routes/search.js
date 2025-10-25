
function search_bar(fastify)
{
    fastify.get(`/users/search`, async  (req, reply) => {
        const query = req.query.username || "";
        const data = await fastify.db.all(`SELECT users.id, users.username, infos.profileImage
                                           FROM users
                                           INNER JOIN infos ON users.id=infos.user_id
                                           WHERE LOWER(users.username) LIKE LOWER(?)`,[`%${query}%`]);
        reply.code(200).send(data);
    })
}

module.exports = search_bar;