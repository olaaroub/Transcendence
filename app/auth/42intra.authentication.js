import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utils.js';

const domain = process.env.DOMAIN;


async function callbackHandler(req, reply) {
    try {
        const res = await this.authIntra.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw ({ error: "getAccessTokenFromAuthorizationCodeFlow failed" });
        const dataUser = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`
            }
        });
        if (!dataUser.ok)
            throw { error: "you have error in fetch data user" };
        const userdata = await dataUser.json();
        let lastuser;
        const data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([userdata.email]);
        let token;
        if (data)
            token = this.jwt.sign(data, { expiresIn: '1h' });
        else {
            const AvatarUrl = await DownoladImageFromUrl(userdata.image.versions.small, "_intra");
            lastuser = this.db.prepare("INSERT INTO users(username, email, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                .get([userdata.usual_full_name, userdata.email, "intra"]);
            token = this.jwt.sign(lastuser, { expiresIn: '1h' });
            const createNewUserRes = await fetch('http://user-service-dev:3002/api/user/createNewUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: lastuser.id,
                    username: lastuser.username,
                    avatar_url: AvatarUrl.avatar_path
                })
            });
            console.log(createNewUserRes);
            if (!createNewUserRes.ok) // khasni nmseh avatar hnaya
            {
                await fs.promises.unlink(AvatarUrl.file_name);
                this.db.prepare('DELETE FROM users WHERE id = ?').run([lastuser.id]);
                reply.redirect(`${domain}/login?auth=failed&message='failed to create new user'`);
            }
        }
        // console.log(`${domain}/login?token=${token}&id=${lastuser ? lastuser.id : data.id}`);
        reply.redirect(`${domain}/login?token=${token}&id=${lastuser ? lastuser.id : data.id}`);
    }
    catch (err) {
        console.log(err)
        reply.redirect(`${domain}/login?auth=failed`);
    }
}



async function authIntra(fastify, opts) {
    try {
        const { intraId, intraSecret, cookieSecret } = opts.secrets;
        if (!intraId || !intraSecret || !cookieSecret)
            throw ("No intra credentials provided!")
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
    catch (error) {
        console.log(error);
    }
}

// module.exports = authIntra;
export default authIntra;