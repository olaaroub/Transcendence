import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import dbconfig from './database.config.js'
import vault from 'node-vault';
import privateRoutes from './private.routes.js';
import { publicRoutes } from './public.routes.js';
import websocket from '@fastify/websocket'
async function getJwtSecret() {
  try {

    const vaultPath = process.env.VAULT_SECRET_PATH

    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.USER_SERVICE_TOKEN
    };

    const vaultClient = vault(options);
    console.log(`reading secrets from: ${vaultPath}`);
    const { data } = await vaultClient.read(vaultPath);

    return {
      jwtSecret: data.data.jwt_secret,
    };


  } catch (err) {
    console.error("Error fetching secret from Vault:", err.message);
    process.exit(1);
  }
}



async function main() {

  const fastify = Fastify({ logger: true });

  const db = await dbconfig();
  fastify.decorate('db', db);
  console.log("Fetching JWT secret from Vault...");
  const secrets = await getJwtSecret();
  console.log("Secret fetched successfully ");
  fastify.register(fastifyJwt, {
    secret: secrets.jwtSecret
  });
  const sockets = new Map();
  fastify.decorate('sockets', sockets);
  fastify.register(websocket)
  fastify.register(privateRoutes, {
    prefix: '/api'
  });
  fastify.register(publicRoutes, {
    prefix: '/api'
  })
  await fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });
  try {
    fastify.listen({
      port: process.env.PORT,
      host: process.env.HOST
    });
    console.log(`Server listening on ${process.env.HOST}:${process.env.PORT}`);
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }

}

main();