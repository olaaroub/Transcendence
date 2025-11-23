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
        console.log(`email ${emailData.email}`);
        const data = this.db.get("SELECT id, username FROM users WHERE email = ? AND auth_provider = ?", [emailData.email, "github"]);
        let jwtPaylod;
        if (data)
            jwtPaylod = data;
        else
        {
            lastuser = this.db.prepare("INSERT INTO users(email, username, auth_provider) VALUES (?, ?, ?)").run(emailData.email, userInfo.name, "github");
            console.log(`last userrrrrrrrrrrrrrrrrrrrrrrrr ${lastuser.lastID}`);
            jwtPaylod = {id: lastuser.lastID, username: userInfo.name};
        }
        const token = this.jwt.sign(jwtPaylod, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${jwtPaylod.id}`);
    }
    catch (err)
    {
        console.log(err);
        reply.code(500).send({message: "you have error"});

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


// ===>
//     async function githubauth (fastify)
// {
//     //http://localhost:3000/auth/github/callback
//     await fastify.register(cookie, {
//         secret: "fjfjdie803922873496-7qb8dv88s3628eb12qvu759394djdus"
//     })
//     await fastify.register(oauth2, {
//         name: 'github_oauth',

//         credentials: {
//             client: {
//                 id: 'Ov23liotsiRSjkEtLbBC',
//                 secret: '7afe5fe0f3c169686ebf8e0fa8b2c909ed527607'
//             },
//             auth: oauth2.GITHUB_CONFIGURATION
//         },
//         scope: ['user:email'],
//         startRedirectPath: '/auth/github', 
//         callbackUri: 'https://localhost:5173/api/auth/github/callback',
//         cookie: {
//             secure: false,
//             sameSite: 'lax',
//             path: '/api/auth/github/callback'
//         }
//     })
//     fastify.get('/auth/github/callback', githubCallback);
// }
// ==>







// ====>
// async function githubauth(fastify) {
//     // 1. Validate that secrets exist (Good practice to prevent startup crashes)
//     if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
//         throw new Error('Missing GitHub Environment Variables');
//     }

//     const DOMAIN = process.env.DOMAIN || 'https://localhost:5173'; // Fallback just in case

//     await fastify.register(require('@fastify/cookie'), {
//         secret: process.env.COOKIE_SECRET // Loaded from env
//     });

//     await fastify.register(require('@fastify/oauth2'), {
//         name: 'github_oauth',
//         credentials: {
//             client: {
//                 id: process.env.GITHUB_CLIENT_ID,     
//                 secret: process.env.GITHUB_CLIENT_SECRET 
//             },
//             auth: require('@fastify/oauth2').GITHUB_CONFIGURATION
//         },
//         scope: ['user:email'],
//         startRedirectPath: '/auth/github',
//         // Construct the callback URI dynamically based on the environment domain
//         callbackUri: `${DOMAIN}/auth/github/callback`, 
//         cookie: {
//             secure: false,
//             sameSite: 'lax',
//             path: '/'
//         }
//     });

//     fastify.get('/auth/github/callback', githubCallback);
// }
// ===>

module.exports = githubauth;