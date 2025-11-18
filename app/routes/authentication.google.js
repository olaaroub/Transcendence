const oauth2 = require('@fastify/oauth2');
const cookie = require('@fastify/cookie');
/*
clientID = 803922873496-7qb8dv88s3628eb12qvu75ohogg76cpn.apps.googleusercontent.com
clientSecret= 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


*/

async function googleCallback (req, reply)
{
    try
    {
        const res = await this.google_oauth.getAccessTokenFromAuthorizationCodeFlow(req);
        const userInfo = await this.google_oauth.userinfo(res.token.access_token);
        reply.code(200).send(userInfo);
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
        startRedirectPath: '/login/google', 
        callbackUri: 'http://localhost:3000/api/auth/google/callback',
        cookie: {
            secure: false, // hit localhost (http)
            sameSite: 'lax',
            path: '/' // bach cookie ydoz mn Google l 3ndk
        }
    })
    fastify.get('/auth/google/callback', googleCallback);
}

module.exports = authgoogle;