// const oauth2 = require('@fastify/oauth2');
// const cookie = require('@fastify/cookie');
// const DownoladImageFromUrl = require('./utilis')

import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utilis.js';

// const domain = process.env.DOMAIN;
const domain = 'localhost:5173';


async function callbackHandler(req, reply)
{
    try {
        const res = await this.authIntra.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw ({error: "getAccessTokenFromAuthorizationCodeFlow failed"});
        const dataUser = await  fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`
            }
        });
        if (!dataUser.ok)
            throw {error: "you have error in fetch data user"};
        const userdata = await dataUser.json();
        const data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([userdata.email]);
        let jwtPaylod;
        if (data)
            jwtPaylod = data;
        else
        {
            const AvatarUrl = await DownoladImageFromUrl(userdata.image.versions.small, "_intra");
            lastuser = this.db.prepare("INSERT INTO users(username, email, auth_provider, profileImage) VALUES (?, ?, ?, ?) RETURNING id, username").get([userdata.usual_full_name, userdata.email, "intra", AvatarUrl]);
            jwtPaylod = lastuser;
        }
        const token = this.jwt.sign(jwtPaylod, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${jwtPaylod.id}`);
    }
    catch (err)
    {
        console.log(err)
        reply.redirect(`${domain}/login?auth=failed`);
    }
}



async function authIntra(fastify, opts)
{
    try{
        const { intraId, intraSecret, cookieSecret } = opts.secrets;
        if(!intraId || !intraSecret || !cookieSecret)
            throw("No intra credentials provided!")
        await fastify.register(cookie, {
            secret: cookieSecret
        })
        await fastify.register(oauth2, {
            name: 'authIntra',
            scope: ['public'],
    
            credentials: {
                client: {
                    id: intraId,
                    secret: intraSecret
                    },
                auth: {
                    authorizeHost: 'https://api.intra.42.fr',
                    authorizePath: '/oauth/authorize',
                    tokenHost: 'https://api.intra.42.fr',
                    tokenPath: '/oauth/token'
                }
            },
            startRedirectPath: '/auth/intra',
            callbackUri: `${domain}/api/auth/intra/callback`,
            cookie: {
                secure: false,
                sameSite: 'lax',
                path: '/api/auth/intra/callback'
            }
        }
        );
        fastify.get("/auth/intra/callback", callbackHandler);
    }
    catch (error){
        console.log(error);
    }
}

// module.exports = authIntra;
export default authIntra;