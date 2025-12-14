// const path = require('path');
// const fs = require('fs');
import path from 'path';
import fs from 'fs';


async function deleteAccountHandler(req, reply) {
    const __dirname = import.meta.dirname;
    const id = req.params.id;
    const respons = await fetch(`http://auth-service-dev:3001/api/auth/deletAccount/${id}`, {
        method: 'DELETE'
    });
    if (!respons.ok)
    {
        console.log("failed to delete account");
        reply.code(respons.status).send({message:"failed to delete account"});
    }
    const avatar = this.db.prepare(`SELECT avatar_url FROM userInfo WHERE id = ?`).get([id]);
    const avatarName = path.basename(avatar.avatar_url);

    if (avatarName != "Default_pfp.jpg")
        await fs.promises.unlink(path.join(__dirname, 'static', avatarName)).catch(() => {});
    this.db.prepare(`DELETE FROM userInfo WHERE id = ?`).run([id]);
    reply.code(204).send({ success: true });
}

async function deleteAccount(fastify) {
    fastify.delete("/user/deleteAccount/:id", deleteAccountHandler);
}

// module.exports = deleteAccount;
export default deleteAccount;