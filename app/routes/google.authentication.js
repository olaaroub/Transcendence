const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');
const DownoladImageFromUrl = require('./utilis');

const domain = process.env.DOMAIN;


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

        let jwtPaylod;
        if (userData)
            jwtPaylod = userData;
        else
        {
            const AvatarUrl = await DownoladImageFromUrl(userInfo.picture, "_google");
            const info = await this.db.run("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?)", [userInfo.name, userInfo.email, "google", AvatarUrl]);
            jwtPaylod = {id: info.lastID, username: userInfo.name};
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
