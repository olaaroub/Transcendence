import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import createError from 'http-errors';


async function setupTowFaHandler(req, reply)
{
    const id = req.params.id;

    const { towFaEnabled } = this.db.prepare("SELECT towFaEnabled FROM users WHERE id = ?").get(id);

    // console.log(towFaEnabled);
    if (towFaEnabled)
        throw createError.Unauthorized("you can't setup tow factor twise");
    const secret = speakeasy.generateSecret({
        name: `42TrancendensUserID_${id}` // I will change the id to username
    });

    this.db.prepare("UPDATE users SET towFaSecret = ?, towFaEnabled = TRUE  WHERE id = ?")
        .run(secret.base32, id)

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return {
        secret: secret.base32,
        qrCodeUrl: qrCodeUrl
    }
}

async function verifyTowFaHandler(req, reply)
{
    const {token} = req.body;
    const id = req.params.id;

    const {towFaSecret, towFaEnabled} = this.db.prepare("SELECT towFaSecret, towFaEnabled FROM users WHERE id = ?")
                                            .get(id);

    if (!towFaEnabled)
        throw createError.BadRequest("please enable the tow factor authentication !");
    else if (!towFaSecret)
        throw createError.BadRequest("please setup the tow factor authentication first, and then request this endpoint !");
    console.log(towFaSecret, towFaEnabled);
    const verify = speakeasy.totp.verify({
        secret: towFaSecret,
        encoding: 'base32',
        token: token
    });

    if (!verify)
        throw createError.Unauthorized("the digits-code is invalid");

    return {
        success: true,
        message: "you're successfly verifyed !"
    }
}

async function towFaDisablingHandler(req, reply)
{
    const id = req.params.id;

    this.db.prepare('UPDATE users SET towFaEnabled = false, towFaSecret = NULL WHERE id = ?').run(id);
    return {
        success: true,
        message: "you're successfly disabled towfa!"
    }
}

export default async function towFactorAuthentication(fastify)
{
    fastify.get('/auth/2fa/setup/:id', setupTowFaHandler);
    fastify.post('/auth/2fa/verify/:id', verifyTowFaHandler);
    fastify.post('/auth/2fa/disable/:id', towFaDisablingHandler);
}