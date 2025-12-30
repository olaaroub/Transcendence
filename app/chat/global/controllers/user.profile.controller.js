

export async function updateUsername(req, reply)
{
    const id = req.params.id;
    const { username } = req.body;

    // console.log(username, " ------------- ", id);
    this.db.prepare('UPDATE usersCash SET username = ? WHERE id = ?').run(id, username);
    req.log.info({ userId: id, NewUserName: username }, "User username updated in cache");
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
