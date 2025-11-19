const fastify = require('fastify')({ logger: true })
const routes = require('./routes/mainRoutes');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifyMetrics = require('fastify-metrics');

const vault = require('node-vault');

async function getJwtSecret() {
  try {
    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN
    };

    const vaultClient = vault(options);
    const { data } = await vaultClient.read('secret/data/transcendence');

    return data.data.JWT_SECRET;

  } catch (err) {
    console.error("Error fetching secret from Vault:", err.message);
    process.exit(1);
  }
}

async function start() {

  console.log("Fetching JWT secret from Vault...");
  const jwtSecret = await getJwtSecret();
  console.log("Secret fetched successfully.");

  const db = await creatTable();


  await fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  fastify.register(fastifyJwt, {
    secret: jwtSecret
  });

  await fastify.register(fastifyMetrics, {
    endpoint: '/metrics'
  });

  fastify.decorate('db', db);
  fastify.register(require('@fastify/websocket'))

  fastify.addHook('preHandler', async (request, reply) => {
    const url = request.url;
    console.log("Requested URL:", url);

    if (
      url.includes('/login') ||
      url.includes('/signUp') ||
      url.includes('/auth') ||
      url === '/' ||
      url.startsWith('/api/public') ||
      url === '/metrics'
    ) {
      return;
    }

    try {

      const payload = await request.jwtVerify();

      request.userId = payload.userId;
      request.username = payload.username;
      console.log("hello");


    }
    catch (err) {
      console.log("No token provided or invalid token");
      reply.code(401).send({ error: 'Unauthorized: No valid token provided' });
    }
  });

  fastify.register(routes, {
    prefix: '/api'
  });

  try {
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

start();