// const oauth2 = require('@fastify/oauth2');
// const cookie = require('@fastify/cookie');
// const DownoladImageFromUrl = require('./utilis');

import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utilis.js';
/*
clientID = 803922873496-7qb8dv88s3628eb12qvu75ohogg76cpn.apps.githubusercontent.com
clientSecret= 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

            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture);
            const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "github", AvatarUrl]);
            const lastID = info.lastInsertRowid;
            token = this.jwt.sign({userId: lastID, username: userInfo.name}, { expiresIn: '1h' });
            reply.code(200).send({message: "login successfully", id: lastID, token: token});
*/

const domain = process.env.DOMAIN;



async function githubCallback(req, reply) {
    try {
        const res = await this.github_oauth.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw ({ error: "getAccessTokenFromAuthorizationCodeFlow failed" });
        const userResponse = await fetch(`https://api.github.com/user`, {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`,
                'User-Agent': 'transendance_app'
            }
        });
        const userInfo = await userResponse.json();
        if (!userInfo)
            throw ({ error: "get userinfo failed" });
        // console.log(userInfo);
        // reply.send(userInfo);
        const emailResponse = await fetch(`https://api.github.com/user/emails`, {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`,
                'User-Agent': 'transendance_app'
            }
        })

        const emails = await emailResponse.json();
        let lastuser;
        const emailData = emails.find(email => email.primary == true);
        // console.log(emailData);
        const AvatarUrl = await DownoladImageFromUrl(userInfo.avatar_url, "_github");
        const data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([emailData.email]);
        // console.log("data is: ", data);
        let token;
        if (data)
            token = this.jwt.sign(data, { expiresIn: '1h' });
        else {
            lastuser = this.db.prepare("INSERT INTO users(email, username, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                              .get([emailData.email, userInfo.name, "github"]);
            token = this.jwt.sign(lastuser, { expiresIn: '1h' });
            const createNewUserRes = await fetch('http://user-service-dev:3002/api/users/createNewUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: lastuser.id,
                    username: lastuser.username,
                    avatar_url: AvatarUrl
                })
            });
            if (!createNewUserRes.ok) // khasni nmseh avatar hnaya
            {
                this.db.prepare('DELETE FROM users WHERE id = ?').run([lastuser.id]);
                reply.redirect(`${domain}/login?auth=failed&message='failed to create new user'`);
            }
            console.log("last user: ", lastuser);
            if (userInfo.bio)
                this.db.prepare("UPDATE infos SET bio = ?  WHERE user_id = ?").run([userInfo.bio, lastuser.lastID]);
        }
        reply.redirect(`${domain}/login?token=${token}&id=${lastuser ? lastuser.id : data.id}`);
    }
    catch (err) {
        console.log(err);
        reply.redirect(`${domain}/login?auth=failed`);

    }
}

async function githubauth(fastify, opts) {
    try {
        const { githubId, githubSecret, cookieSecret } = opts.secrets;

        if (!githubId || !githubSecret || !cookieSecret)
            throw ("No github credentials provided!")
        await fastify.register(cookie, {
            secret: cookieSecret
        })

        await fastify.register(oauth2, {
            name: 'github_oauth',

            credentials: {
                client: {
                    id: githubId,
                    secret: githubSecret
                },
                auth: oauth2.GITHUB_CONFIGURATION
            },
            scope: ['user:email'],
            startRedirectPath: '/auth/github',
            callbackUri: `${domain}/api/auth/github/callback`,
            cookie: {
                secure: false,
                sameSite: 'lax',
                path: '/api/auth/github/callback'
            }
        })
        fastify.get('/auth/github/callback', githubCallback);
    }
    catch (error) {
        console.log(error);
    }

}

// module.exports = githubauth;
export default githubauth;