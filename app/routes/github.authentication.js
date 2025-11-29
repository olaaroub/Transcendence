const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const DownoladImageFromUrl = require('./utilis');
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



async function githubCallback (req, reply)
{
    try
    {
        const res = await this.github_oauth.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw ({error: "getAccessTokenFromAuthorizationCodeFlow failed"});
        const userResponse = await fetch (`https://api.github.com/user`, {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`,
                'User-Agent': 'transendance_app'
            }
        });
        const userInfo = await userResponse.json();
        if (!userInfo)
            throw ({error: "get userinfo failed"});
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
        const AvatarUrl = await DownoladImageFromUrl(userInfo.avatar_url, "_github");
        const data = await this.db.get("SELECT id, username FROM users WHERE email = ?", [emailData.email]);
        let jwtPaylod;
        if (data)
            jwtPaylod = data;
        else
        {
            lastuser = await this.db.run("INSERT INTO users(email, username, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [emailData.email, userInfo.name, "github", AvatarUrl]);
            if (userInfo.bio)
                await this.db.run("UPDATE infos SET bio = ?  WHERE user_id = ?", [userInfo.bio, lastuser.lastID]);
            jwtPaylod = {id: lastuser.lastID, username: userInfo.name};
        }
        const token = this.jwt.sign(jwtPaylod, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${jwtPaylod.id}`);
    }
    catch (err)
    {
        console.log(err);
        reply.redirect(`${domain}/login?auth=failed`);

    }
}

async function githubauth (fastify, opts)
{
    try{
        const { githubId, githubSecret, cookieSecret } = opts.secrets;

        if(!githubId || !githubSecret || !cookieSecret)
            throw("No github credentials provided!")
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

module.exports = githubauth;