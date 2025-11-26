const fastify = require('fastify')({ logger: false })
// const routes = require('./routes/mainRoutes');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifyMetrics = require('fastify-metrics');
const path = require('path');
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
    allowedHeaders: ['Access-Control-Allow-Origin']
  });



  fastify.register(fastifyJwt, {
    secret: jwtSecret
  });

  fastify.addHook("preHandler", (request, _reply, done) => {
    const url = request.url;
    console.log("Requested URL:", url);
    done();
  });

  await fastify.register(fastifyMetrics, {
    endpoint: '/metrics'
  });

    fastify.decorate('db', db);
    const sockets = new Map();
    fastify.decorate('sockets', sockets);
    fastify.register(require('@fastify/websocket'))
    console.log(path.join(__dirname, '/static'));
    // await fastify.register(require('@fastify/static') , {
    //   root: path.join(__dirname, 'static'),
    //   prefix: '/public/'
    // });
    fastify.register(require('./routes/private.routes'), {
        prefix: '/api'
    });
    fastify.register(require('./routes/public.routes'), {
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