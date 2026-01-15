import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utils.js';
import fs from 'fs';

const domain = process.env.DOMAIN;
const ext = process.env.SERVICE_EXT || '-prod';
const USER_SERVICE_URL = `http://user-service${ext}:3002`;


async function callbackHandler(req, reply) {
    try {
        const res = await this.authIntra.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw new Error("getAccessTokenFromAuthorizationCodeFlow failed");
        const dataUser = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`
            }
        });

        if (!dataUser.ok)
            throw new Error("failed to fetch the data of user in intra");

        const userdata = await dataUser.json();
        let data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([userdata.email]);

        if (!data)
        {
            const AvatarUrl = await DownoladImageFromUrl(userdata.image.versions.small, "_intra", req.log);
            data = this.db.prepare("INSERT INTO users(username, email, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                .get([userdata.usual_full_name, userdata.email, "intra"]);

            if (!data) throw new Error("Database insert failed");

            const createNewUserRes = await fetch(`${USER_SERVICE_URL}/api/user/createNewUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: data.id,
                    username: data.username,
                    avatar_url: AvatarUrl.avatar_path
                })
            });

            if (!createNewUserRes.ok)
            {
                await fs.promises.unlink(AvatarUrl.file_path).catch(() => { });
                this.db.prepare('DELETE FROM users WHERE id = ?').run([data.id]);
                throw new Error("Failed to sync new user with User Service");
            }
            req.log.info({ userId: data.id }, "New user registered via 42 Intra");
        }
        this.customMetrics.loginCounter.inc({ status: 'success', provider: 'intra' });
        const token = this.jwt.sign(data, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${data.id}`);
    }
    catch (err) {
        this.customMetrics.loginCounter.inc({ status: 'failure', provider: 'intra' });
        req.log.error({ msg: "Intra OAuth Failed", err: err });
        reply.redirect(`${domain}/login?auth=failed`);
    }
}

async function authIntra(fastify, opts) {

    const { intraId, intraSecret, cookieSecret } = opts.secrets;

    if (!intraId || !intraSecret || !cookieSecret)
        throw new Error("No intra credentials provided!")

    await fastify.register(cookie, {
        secret: cookieSecret
    })
    await fastify.register(oauth2, {
        name: 'authIntra',
        scope: ['public'],

        credentials: {
            client: {
                id: intraId,
                secret: intraSecret
            },
            auth: {
                authorizeHost: 'https://api.intra.42.fr',
                authorizePath: '/oauth/authorize',
                tokenHost: 'https://api.intra.42.fr',
                tokenPath: '/oauth/token'
            }
        },
        startRedirectPath: '/auth/intra',
        callbackUri: `${domain}/api/auth/intra/callback`,
        cookie: {
            secure: false,
            sameSite: 'lax',
            path: '/api/auth/intra/callback'
        }
    });
    fastify.get("/auth/intra/callback", callbackHandler);
}

export default authIntra;
