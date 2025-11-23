const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');
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

async function DownoladImageFromUrl(url)
{

    const AvatarData = await fetch(url);

    if (!AvatarData.ok)
        throw ({error: 'Network response was not ok'});
    // get extention
    const contentType =  AvatarData.headers.get('content-type');
    const mimType = {
        'image/jpeg': '.jpg',
        'image/jpg':  '.jpg',
        'image/png':  '.png',
        'image/webp': '.webp',
        'image/gif':  '.gif'
    }
    const ext = mimType[contentType] || '.jpg';
    // convert the data stream to array of buffer to convert it after to buffer type
    const arrayBuffer = await AvatarData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file_name = uuidv4() + "_githubUser" + ext;
    const file_path = path.join(__dirname, '../static', file_name);

    await fs.promises.writeFile(file_path, buffer);
    return `/public/${file_name}`;
}

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
        const emailResponse = await fetch(`https://api.github.com/user/emails`, {
            headers: {
              'Authorization': `Bearer ${res.token.access_token}`,
              'User-Agent': 'transendance_app'
            }
          })
        const emails = await emailResponse.json();
        let lastuser;
        const emailData = emails.find(email => email.primary == true);
        const data = await this.db.get("SELECT id, username FROM users WHERE email = ?", [emailData.email]);

        let jwtPaylod;
        if (data)
            jwtPaylod = data;
        else
        {
            lastuser = await this.db.run("INSERT INTO users(email, username, auth_provider) VALUES (?, ?, ?)", [emailData.email, userInfo.name, "github"]);
            jwtPaylod = {id: lastuser.lastID, username: userInfo.name};
        }
        const token = this.jwt.sign(jwtPaylod, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${jwtPaylod.id}`);
    }
    catch (err)
    {
        console.log(err);
        // reply.code(500).send({message: "you have error"});
        reply.redirect(`${domain}/ login?auth=failed`);

    }
}

async function githubauth (fastify)
{
    try{

        if(!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.COOKIE_SECRET)
            throw("No github credentials provided!")
        await fastify.register(cookie, {
            secret: process.env.COOKIE_SECRET
        })
        await fastify.register(oauth2, {
            name: 'github_oauth',

            credentials: {
                client: {
                id: process.env.GITHUB_CLIENT_ID,
                secret: process.env.GITHUB_CLIENT_SECRET
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