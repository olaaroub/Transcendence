// const oauth2 = require('@fastify/oauth2');
// const cookie = require('@fastify/cookie');
// const DownoladImageFromUrl = require('./utilis');
import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utilis.js';
const domain = process.env.DOMAIN;


async function googleCallback(req, reply) {
    try {

        const res = await this.google_oauth.getAccessTokenFromAuthorizationCodeFlow(req);
        if (!res)
            throw ({ error: "getAccessTokenFromAuthorizationCodeFlow failed" });
        const userInfo = await this.google_oauth.userinfo(res.token.access_token);

        if (!userInfo)
            throw ({ error: "get userinfo failed" });
        const userData = await this.db.prepare("SELECT id, username, auth_provider FROM users WHERE email = ?")
                                      .get([userInfo.email]);

        let token;
        let info;
        if (userData)
            token = this.jwt.sign(userData, { expiresIn: '1h' });
        else {
            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture, "_google");
            info = this.db.prepare("INSERT INTO users(username, email, auth_provider) VALUES (?, ?, ?) RETURNING id, username").get([userInfo.name, userInfo.email, "google"]);
            if (!info)
                throw {error: "can not insert user"};
            token = this.jwt.sign(info, { expiresIn: '1h' });
            const createNewUserRes = await fetch('http://user-service-dev:3002/api/users/createNewUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // I will add the secret key to check the request is from the microserves
                },
                body: JSON.stringify({
                    user_id: info.id,
                    username: info.username,
                    avatar_url: AvatarUrl
                })
            });
            if (!createNewUserRes.ok) // khasni nmseh avatar hnaya
            {
                this.db.prepare('DELETE FROM users WHERE id = ?').run([info.id]);
                reply.redirect(`${domain}/login?auth=failed&message=failed to create new user`);
            }
        }
        console.log(`${domain}/login?token=${token}&id=${info ? info.id : userData.id}`);
        reply.redirect(`${domain}/login?token=${token}&id=${info ? info.id : userData.id}`);
    }
    catch (err) {
        console.log(err);
        reply.redirect(`${domain}/login?auth=failed`);
    }
}

async function authgoogle(fastify, opts) {
    try {
        const { googleId, googleSecret, cookieSecret } = opts.secrets;
        // console.log("hellllooooooooo     ",googleId);

        if (!googleId || !googleSecret || !cookieSecret)
            throw ("No google credentials provided!")
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
    catch (error) {
        console.log(error);
    }
}

// module.exports = authgoogle;
export default authgoogle;
