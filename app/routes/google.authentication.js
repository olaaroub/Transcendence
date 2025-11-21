const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');
/*
clientID = 803922873496-7qb8dv88s3628eb12qvu75ohogg76cpn.apps.googleusercontent.com
clientSecret= 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

            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture);
            const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "google", AvatarUrl]);
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

    const file_name = uuidv4() + "_googleUser" + ext;
    const file_path = path.join(__dirname, '../static', file_name);

    await fs.promises.writeFile(file_path, buffer);
    return `/public/${file_name}`;
} 

async function googleCallback (req, reply)
{
    try
    {
        const res = await this.google_oauth.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw ({error: "getAccessTokenFromAuthorizationCodeFlow failed"});
        const userInfo = await this.google_oauth.userinfo(res.token.access_token);

        if (!userInfo)
            throw ({error: "get userinfo failed"});
        const userData = await this.db.get("SELECT id, username FROM users WHERE email = ? AND auth_provider = ?", [userInfo.email, "google"]);
        let token;
        if (userData)
        {
            token = this.jwt.sign({userId: userData.id, username: userData.username}, { expiresIn: '1h' })
            reply.redirect(`http://localhost:5173/login?success=true&token=${token}&id=${userData.id}`);
            // reply.code(200).send({message: "login successfully", success: true, id: userData.id, token: token});
        }
        else
        {
            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture);
            const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "google", AvatarUrl]);
            const lastID = info.lastInsertRowid;

            token = this.jwt.sign({userId: lastID, username: userInfo.name}, { expiresIn: '1h' });
            reply.redirect(`http://localhost:5173/login?success=true&token=${token}&id=${lastID}`);

            //reply.code(200).send({message: "login successfully", success: true,id: lastID, token: token});
        }
    }
    catch (err)
    {
        console.log(err);
        reply.code(500).send({message: "you have error"});
    }
}

async function authgoogle (fastify)
{
    //http://localhost:3000/auth/google/callback
    await fastify.register(cookie, {
        secret: "fjfjdie803922873496-7qb8dv88s3628eb12qvu759394djdus"
    })
    await fastify.register(oauth2, {
        name: 'google_oauth',
        scope: ['profile', 'email'],

        discovery: {
            issuer: 'https://accounts.google.com'
        },
        credentials: {
            client: {
            id: '803922873496-7qb8dv88s3628eb12qvu75ohogg76cpn.apps.googleusercontent.com',
            secret: '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'
            }
        },
        startRedirectPath: '/auth/google', 
        callbackUri: 'http://localhost:5173/api/auth/google/callback',
        cookie: {
            secure: false,
            sameSite: 'lax',
            path: '/api/auth/google/callback'
        }
    })
    fastify.get('/auth/google/callback', googleCallback);
}

module.exports = authgoogle;
