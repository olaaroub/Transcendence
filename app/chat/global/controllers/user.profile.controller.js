

export async function updateUsername(req)
{
    const id = req.params.id;
    const { username } = req.body;

    try {
        this.db.prepare('UPDATE usersCash SET username = ? WHERE id = ?').run(username, id);
        req.log.info({ userId: id, NewUserName: username }, "User username updated in cache");
        return {ok: true}
    } catch(err)
    {
        req.log.err({userID:id ,err}, "error in updateUsername");
    }
}

export async function updateAvatarUrl(req)
{
    const id = req.params.id;
    const { newAvatarUrl } = req.body;

    this.db.prepare('UPDATE usersCash SET avatar_url = ? WHERE id = ?').run(newAvatarUrl, id);
    req.log.info({ userId: id, newAvatarUrl }, "User avatar URL updated in cache");
}


export async function deleteAccount(req)
{
    const id = req.params.id;

    this.db.prepare('DELETE FROM usersCash WHERE id = ?').run(id);
    req.log.info({ userId: id }, "User account deleted from cache");
}
