

export async function updateUsername(req, reply)
{
    const id = req.params.id;
    const { newUserName } = req.body.username;

    this.db.prepare('UPDATE usersCash SET username = ? WHERE id = ?').run(id, newUserName);
    req.log.info({ userId: id, newUsername: newUserName }, "User username updated in cache");
}

export async function updateAvatarUrl(req, reply)
{
    const id = req.params.id;
    const { newAvatarUrl } = req.body.newAvatarUrl;

    this.db.prepare('UPDATE usersCash SET avatar_url = ? WHERE id = ?').run(id, newAvatarUrl);
    req.log.info({ userId: id, newAvatarUrl }, "User avatar URL updated in cache");
}

export async function deleteAccount(req, reply)
{
    const id = req.params.id;

    this.db.prepare('DELETE FROM usersCash WHERE id = ?').run(id);
    req.log.info({ userId: id }, "User account deleted from cache");
}
