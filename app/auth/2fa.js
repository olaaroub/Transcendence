import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import createError from 'http-errors';

async function setupTowFaHandler(req, reply) {
    const id = req.params.id;
    const { towFaEnabled } = this.db.prepare("SELECT towFaEnabled FROM users WHERE id = ?").get(id);

    if (towFaEnabled)
        throw createError.Conflict("2FA already enabled!");

    const secret = speakeasy.generateSecret({
        name: `42TrancendensUserID_${id}`
    });

    this.db.prepare("UPDATE users SET towFaSecret = ? WHERE id = ?").run(secret.base32, id)

    req.log.info({ userId: id }, "2FA Setup initiated (Secret generated)");

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return {
        secret: secret.base32,
        qrCode: qrCodeUrl
    }
}

async function verifyTowFaHandler(req, reply) {
    const { token } = req.body;
    const id = req.params.id;

    const { towFaSecret, towFaEnabled } = this.db.prepare("SELECT towFaSecret, towFaEnabled FROM users WHERE id = ?")
        .get(id);

    if (!towFaEnabled && !towFaSecret)
        throw createError.BadRequest("2FA setup not enabled");

    const verify = speakeasy.totp.verify({
        secret: towFaSecret,
        encoding: 'base32',
        token: token
    });

    if (!verify) {
        req.log.warn({ userId: id }, "2FA Verification Failed (Invalid Token)");
        throw createError.Unauthorized("Invalid 2FA token");
    }

    if (!towFaEnabled) {
        this.db.prepare('UPDATE users SET towFaEnabled = TRUE WHERE id = ?').run(id);
        req.log.info({ userId: id }, "2FA Enabled Successfully");
    }
    else
        req.log.info({ userId: id }, "2FA Verified Successfully");

    return { success: true, message: "Verification successful" }
}

async function towFaDisablingHandler(req, reply) {
    const id = req.params.id;
    this.db.prepare('UPDATE users SET towFaEnabled = FALSE, towFaSecret = NULL WHERE id = ?').run(id);

    req.log.warn({ userId: id }, "2FA Disabled");

    return { success: true, message: "2FA disabled successfully" }
}

export default async function towFactorAuthentication(fastify) {
    fastify.get('/auth/2fa/setup/:id', setupTowFaHandler);
    fastify.post('/auth/2fa/verify/:id', verifyTowFaHandler);
    fastify.post('/auth/2fa/disable/:id', towFaDisablingHandler);
}
