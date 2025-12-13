import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utils.js';
import path from 'path';
import fs from 'fs';

const domain = process.env.DOMAIN;
const __dirname = import.meta.dirname;

async function googleCallback(req, reply) {

    try {
        const res = await this.google_oauth.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res) {
            throw new Error("getAccessTokenFromAuthorizationCodeFlow failed");
        }

        const userInfo = await this.google_oauth.userinfo(res.token.access_token);
        if (!userInfo) {
            throw new Error("get userinfo failed");
        }

        const userData = await this.db.prepare("SELECT id, username, auth_provider FROM users WHERE email = ?")
            .get([userInfo.email]);

        let info;

        if (userData) {
            info = userData;

            req.log.info({ userId: userData.id }, "User logged in via Google");
        }
        else {
            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture, "_google", req.log);

            info = this.db.prepare("INSERT INTO users(username, email, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                .get([userInfo.name, userInfo.email, "google"]);

            if (!info) throw new Error("Database insert failed");

            const createNewUserRes = await fetch('http://user-service-dev:3002/api/user/createNewUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: info.id,
                    username: info.username,
                    avatar_url: AvatarUrl
                })
            });

            if (!createNewUserRes.ok) {
                const fileName = path.basename(AvatarUrl);
                await fs.promises.unlink(path.join(__dirname, 'static', fileName)).catch(() => {});

                this.db.prepare('DELETE FROM users WHERE id = ?').run([info.id]);
                throw new Error("Failed to sync new user with User Service");
            }

            req.log.info({ userId: info.id }, "New user registered via Google");
        }
        const token = this.jwt.sign({ id: info.id, username: info.username }, { expiresIn: '1h' });

        reply.redirect(`${domain}/login?token=${token}&id=${info.id}`);

    } catch (err) {
        req.log.error({ msg: "Google OAuth Failed", err: err });
        reply.redirect(`${domain}/login?error=${encodeURIComponent(err.message || "Internal Server Error")}`); // encodeURIComponent that encode the elements that is unsafe in the url (in example: if you have in error:'?' this in url mean you have query this will do error but using this function will encode it to (%43: example) )
    }
}

async function authgoogle(fastify, opts) {

    const { googleId, googleSecret, cookieSecret } = opts.secrets;

    if (!googleId || !googleSecret || !cookieSecret)
        throw new Error("No google credentials provided!")

    await fastify.register(cookie, {
        secret: cookieSecret
    })

    await fastify.register(oauth2, {
        name: 'google_oauth',
        scope: ['profile', 'email'],

        discovery: {
            issuer: 'https://accounts.google.com'
        },
        credentials: {
            client: {
                id: googleId,
                secret: googleSecret
            }
        },
        startRedirectPath: '/auth/google',
        callbackUri: `${domain}/api/auth/google/callback`,
        cookie: {
            secure: false,
            sameSite: 'lax',
            path: '/api/auth/google/callback'
        }
    })
    fastify.get('/auth/google/callback', googleCallback);
}

export default authgoogle;