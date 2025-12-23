import createError from 'http-errors';

async function updateUsername(req, reply)
{
    const id = req.params.id;
    const { newUserName } = body.username;

    this.db.prepare('UPDATE usersCash SET username = ? WHERE id = ?').run(id, newUserName);
    return {ok: true};
}

async function updateAvatarUrl(req, reply)
{
    const id = req.params.id;
    const { newAvatarUrl } = body.newAvatarUrl;

    this.db.prepare('UPDATE usersCash SET avatar_url = ? WHERE id = ?').run(id, newAvatarUrl);
    return {ok: true};
}

async function deleteAccount(req, reply)
{
    const id = req.params.id;

    this.db.prepare('DELETE FROM usersCash WHERE id = ?').run(id);
    return {ok: true};
}
export default async function updateUserCashItems(fastify)
{
    fastify.put('/global-chat/username/:id', updateUsername);
    fastify.put('/global-chat/avatar_url/:id', updateAvatarUrl);
    fastify.delete('/global-chat/account/:id', deleteAccount); 
}