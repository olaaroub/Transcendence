const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
const domain = process.env.DOMAIN;


async function callbackHandler(req, reply)
{
    try {
        console.dir(req);
        const res = await this.authIntra.getAccessTokenFromAuthorizationCodeFlow(req);
        if (!res)
            throw ({error: "getAccessTokenFromAuthorizationCodeFlow failed"});
        const dataUser = await  fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`
            }
        });
        // if (!dataUser.ok)
        //     throw {error: "you have error in fetch data user"};
        const data = await dataUser.json();
        // console.log(data)
        reply.send({dddd: data});
    }
    catch (err)
    {
        console.log(err)
    }
}

async function authIntra(fastify)
{
    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET
    })
    await fastify.register(oauth2, {
        name: 'authIntra',
        scope: ['public'],

        credentials: {
            client: {
                id: process.env.INTRA_CLIENT_ID,
                secret: process.env.INTRA_CLIENT_SECRET
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

module.exports = authIntra;