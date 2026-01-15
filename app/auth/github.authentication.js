import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utils.js';
import fs from 'fs';

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
const ext = process.env.SERVICE_EXT || '-prod';
const USER_SERVICE_URL = `http://user-service${ext}:3002`;

async function githubCallback(req, reply) {
    try {
        const res = await this.github_oauth.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw new Error("getAccessTokenFromAuthorizationCodeFlow failed");

        const userResponse = await fetch(`https://api.github.com/user`, {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`,
                'User-Agent': 'transendance_app'
            }
        });
        const userInfo = await userResponse.json();

        if (!userInfo)
            throw new Error("get userinfo failed");

        const emailResponse = await fetch(`https://api.github.com/user/emails`, {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`,
                'User-Agent': 'transendance_app'
            }
        })
        const emails = await emailResponse.json();

        const emailData = emails.find(email => email.primary == true);

        const AvatarUrl = await DownoladImageFromUrl(userInfo.avatar_url, "_github", req.log);

        let data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([emailData.email]);

        if (!data) {
            data = this.db.prepare("INSERT INTO users(email, username, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                .get([emailData.email, userInfo.name || userInfo.login, "github"]);

            const createNewUserRes = await fetch(`${USER_SERVICE_URL}/api/user/createNewUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: data.id,
                    username: data.username,
                    avatar_url: AvatarUrl.avatar_path,
                    bio: userInfo.bio
                })
            });
            if (!createNewUserRes.ok)
            {
                await fs.promises.unlink(AvatarUrl.file_path).catch(() => { });
                this.db.prepare('DELETE FROM users WHERE id = ?').run([data.id]);
                throw new Error("Failed to sync new user with User Service");
            }

            req.log.info({ userId: data.id }, "New user registered via GitHub");
        }
        this.customMetrics.loginCounter.inc({ status: 'success', provider: 'github' });
        const token = this.jwt.sign(data, { expiresIn: '1h' });
        req.log.info(`user logged successfly to github and redirect them to ${domain}/login?token=${token}&id=${data.id}`)
        reply.redirect(`${domain}/login?token=${token}&id=${data.id}`);
    }
    catch (err) {
        this.customMetrics.loginCounter.inc({ status: 'failure', provider: 'github' });
        req.log.error({ msg: "GitHub OAuth Failed", err: err });
        reply.redirect(`${domain}/login?error=${encodeURIComponent(err.message || "Internal Server Error")}`);
    }
}

async function githubauth(fastify, opts) {

    const { githubId, githubSecret, cookieSecret } = opts.secrets;

    if (!githubId || !githubSecret || !cookieSecret)
        throw new Error("No github credentials provided!")

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

export default githubauth;
