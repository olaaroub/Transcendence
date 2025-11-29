const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');


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
        const userData = await this.db.get("SELECT id, username, auth_provider FROM users WHERE email = ?", [userInfo.email]);

        let token;
        if (userData)
        {
            token = this.jwt.sign({userId: userData.id, username: userData.username}, { expiresIn: '1h' })
            reply.redirect(`${domain}/login?token=${token}&id=${userData.id}`);
        }
        else
        {
            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture);
            const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "google", AvatarUrl]);
            const lastID = info.lastID;
            // console.log(lastID);
            token = this.jwt.sign({userId: lastID, username: userInfo.name}, { expiresIn: '1h' });
            reply.redirect(`${domain}/login?token=${token}&id=${lastID}`);

        }
    }
    catch (err)
    {
        console.log(err);
        // reply.code(500).send({message: "you have error"});
        reply.redirect(`${domain}/login?auth=failed`);

    }
}

async function authgoogle (fastify, opts)
{
    try{
        const {googleId, googleSecret, cookieSecret} = opts.secrets;
        // console.log("hellllooooooooo     ",googleId);

        if(!googleId || !googleSecret || !cookieSecret)
                throw("No google credentials provided!")
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
    catch (error){
        console.log(error);
    }
}

module.exports = authgoogle;
