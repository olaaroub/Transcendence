// import lacalauth from './local.authentication.js'
import routes from './routes.js';
import dbconfig from './database.config.js'
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import Fastify from 'fastify';
import vault from 'node-vault';

async function getSecrets() {
  try {

    const vaultPath = process.env.VAULT_SECRET_PATH

    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.AUTH_SERVICE_TOKEN
    };

    const vaultClient = vault(options);
    console.log(`reading secrets from: ${vaultPath}`);
    const { data } = await vaultClient.read(vaultPath);

    return {
      jwtSecret: data.data.jwt_secret,
      cookieSecret: data.data.cookie_secret,
      googleId: data.data.google_client_id,
      googleSecret: data.data.google_client_secret,
      githubId: data.data.github_client_id,
      githubSecret: data.data.github_client_secret,
      intraId: data.data.intra_client_id,
      intraSecret: data.data.intra_client_secret
    };

  } catch (err) {
    console.error("Error fetching secret from Vault:", err.message);
    process.exit(1);
  }
}



async function main() {
  const fastify = Fastify({ logger: true });
  console.log("Fetching JWT secret from Vault...");
  const secrets = await getSecrets();
  console.log("Secret fetched successfully ");


  await fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });
  // fastify.register(fastifyJwt, {
  //   secret: secrets.jwtSecret
  // });




  fastify.register(fastifyJwt, {
    secret: secrets.jwtSecret
  });


  // fastify.register(publicRoutes, {
  //   prefix: '/api',
  //   secrets: secrets
  // });


  try {
    const db = await dbconfig();
    fastify.decorate('db', db);
    fastify.register(routes, {
      prefix: '/api',
      secrets: secrets
    });
    fastify.listen({
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0'
    });
    console.log(`Server listening on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main();
