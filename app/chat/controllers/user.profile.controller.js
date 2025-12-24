

export async function updateUsername(req, reply)
{
    const id = req.params.id;
    const { newUserName } = req.body.username;

    this.db.prepare('UPDATE usersCash SET username = ? WHERE id = ?').run(id, newUserName);
    return {ok: true};
}

export async function updateAvatarUrl(req, reply)
{
    const id = req.params.id;
    const { newAvatarUrl } = req.body.newAvatarUrl;

    this.db.prepare('UPDATE usersCash SET avatar_url = ? WHERE id = ?').run(id, newAvatarUrl);
    return {ok: true};
}

export async function deleteAccount(req, reply)
{
    const id = req.params.id;

    this.db.prepare('DELETE FROM usersCash WHERE id = ?').run(id);
    return {ok: true};
}
