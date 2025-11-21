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
        console.log(userInfo);
        reply.code(200).send(userInfo);
        // const userData = await this.db.get("SELECT id, username FROM users WHERE email = ? AND auth_provider = ?", [userInfo.email, "github"]);
        // let token;
        // if (userData)
        // {
        //     token = this.jwt.sign({userId: userData.id, username: userData.username}, { expiresIn: '1h' })
        //     reply.redirect(`https://localhost:5173/login?success=true&token=${token}&id=${userData.id}`);
        // }
        // else
        // {
        //     const AvatarUrl = await DownoladImageFromUrl(userInfo.picture);
        //     const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "github", AvatarUrl]);
        //     const lastID = info.lastID;
        //     console.log(lastID);
        //     token = this.jwt.sign({userId: lastID, username: userInfo.name}, { expiresIn: '1h' });
        //     reply.redirect(`https://localhost:5173/login?success=true&token=${token}&id=${lastID}`);

        // }
    }
    catch (err)
    {
        console.log(err);
        reply.code(500).send({message: "you have error"});

    }
}

async function githubauth (fastify)
{
    //http://localhost:3000/auth/github/callback
    await fastify.register(cookie, {
        secret: "fjfjdie803922873496-7qb8dv88s3628eb12qvu759394djdus"
    })
    await fastify.register(oauth2, {
        name: 'github_oauth',
        scope: ['profile', 'email'],

        credentials: {
            client: {
            id: 'Ov23liotsiRSjkEtLbBC',
            secret: '7afe5fe0f3c169686ebf8e0fa8b2c909ed527607'
            },
            auth: oauth2.GITHUB_CONFIGURATION
        },
        startRedirectPath: '/auth/github', 
        callbackUri: 'https://localhost:5173/api/auth/github/callback',
        cookie: {
            secure: false,
            sameSite: 'lax',
            path: '/api/auth/github/callback'
        }
    })
    fastify.get('/auth/github/callback', githubCallback);
}

module.exports = githubauth;