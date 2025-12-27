import path from 'path';
import fs from 'fs';
import createError from 'http-errors';

const __dirname = import.meta.dirname;

const ext = process.env.SERVICE_EXT || '-prod';
const AUTH_SERVICE_URL = `http://auth-service${ext}:3001`;

async function deleteAccountHandler(req, reply) {
    const id = req.params.id;

    const respons = await fetch(`${AUTH_SERVICE_URL}/api/auth/deletAccount/${id}`, {
        method: 'DELETE'
    });
    // delete chat globale user
    if (!respons.ok) {
        req.log.error({ userId: id, status: respons.status }, "Failed to delete account in Auth Service");
        throw createError.BadGateway("Failed to synchronize deletion with Auth Service");
    }

    const avatar = this.db.prepare(`SELECT avatar_url FROM userInfo WHERE id = ?`).get([id]);
    if (avatar) {
        const avatarName = path.basename(avatar.avatar_url);
        if (avatarName !== "Default_pfp.jpg") {
            await fs.promises.unlink(path.join(__dirname, 'static', avatarName)).catch(() => {
                req.log.warn({ err, fileName: avatarName }, "Failed to delete avatar file from disk");
            });
        }
    }

    this.db.prepare(`DELETE FROM userInfo WHERE id = ?`).run([id]);
    req.log.info({ userId: id }, "User account deleted successfully");
    reply.code(204).send();
}

async function deleteAccount(fastify) {
    fastify.delete("/user/deleteAccount/:id", deleteAccountHandler);
}

export default deleteAccount;
