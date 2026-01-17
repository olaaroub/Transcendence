async function deleteAccountHandler(req, reply) {
    const id = req.params.id;

    const info = this.db.prepare("DELETE FROM users WHERE id = ?").run([id]);

    if (info.changes === 0)
        req.log.warn({ userId: id }, "Attempted to delete non-existing account");

    else
        req.log.info({ userId: id }, "Account deleted successfully");

    reply.code(204).send();
}

async function changeUserNameHandler(req)
{
    const id = req.params.id;
    const { username } = req.body;

    req.log.info({ userId: id, newUsername: username }, "Changing username ...");

    this.db.prepare("UPDATE users SET username = ? WHERE id = ?").run([username, id]);
    return { ok: true };
}

async function getAuthProviderAndEmailHandler(req) {
    const id = req.params.id;
    const authprovider = this.db.prepare("SELECT auth_provider, email FROM users WHERE id = ?").get([id]);

    if (!authprovider)
        throw new Error("User not found");

    return authprovider;
}


export default async function localRoutes(fastify)
{
    fastify.delete("/auth/deleteAccount/:id", deleteAccountHandler)
    fastify.put("/auth/changeUsername/:id", changeUserNameHandler)
    fastify.get("/auth/provider/:id", getAuthProviderAndEmailHandler);
}