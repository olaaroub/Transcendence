import oauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import DownoladImageFromUrl from './utils.js';

const domain = process.env.DOMAIN;


async function callbackHandler(req, reply) {
    try {
        const res = await this.authIntra.getAccessTokenFromAuthorizationCodeFlow(req);

        if (!res)
            throw new Error("getAccessTokenFromAuthorizationCodeFlow failed");
        const dataUser = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': `Bearer ${res.token.access_token}`
            }
        });

        if (!dataUser.ok)
            throw new Error("failed to fetch the data of user in intra");

        const userdata = await dataUser.json();
        let data = this.db.prepare("SELECT id, username FROM users WHERE email = ?").get([userdata.email]);

        if (!data) // this email not exist dakchi 3lach I will register it in the database
        {
            const AvatarUrl = await DownoladImageFromUrl(userdata.image.versions.small, "_intra", req.log);
            data = this.db.prepare("INSERT INTO users(username, email, auth_provider) VALUES (?, ?, ?) RETURNING id, username")
                .get([userdata.usual_full_name, userdata.email, "intra"]);
            
            if (!data) throw new Error("Database insert failed");

            const createNewUserRes = await fetch('http://user-service-dev:3002/api/user/createNewUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: data.id,
                    username: data.username,
                    avatar_url: AvatarUrl.avatar_path
                })
            });
            console.log(createNewUserRes);
            if (!createNewUserRes.ok) // khasni nmseh avatar hnaya
            {
                await fs.promises.unlink(AvatarUrl.file_name).catch(() => {});
                this.db.prepare('DELETE FROM users WHERE id = ?').run([data.id]);
                reply.redirect(`${domain}/login?auth=failed&message='failed to create new user'`);
            }
        }
        const token = this.jwt.sign(data, { expiresIn: '1h' });
        reply.redirect(`${domain}/login?token=${token}&id=${data.id}`);
    }
    catch (err) {
        console.log(err)
        reply.redirect(`${domain}/login?auth=failed`);
        // reply.redirect(`${domain}/login?error=${encodeURIComponent(err.message || "Internal Server Error")}`);
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