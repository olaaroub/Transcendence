const fastify = require('fastify')({ logger: false })
const routes = require('./routes/mainRoutes');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const fastifyMetrics = require('fastify-metrics');

async function start() {

  const db = await creatTable();

  await fastify.register(fastifyCors, {
    origin: true, // ba9i khasni npisifi frontend ip
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  fastify.register(fastifyJwt, {
    secret: 'supersecret'
  });

  await fastify.register(fastifyMetrics, {
    endpoint: '/metrics'
  });

  fastify.decorate('db', db);
  fastify.register(require('@fastify/websocket'))

  fastify.addHook('preHandler', async (request, reply) => {
    const url = request.url;
    console.log("Requested URL:", url);


    if (url.includes('/login') || url.includes('/signUp') || url === '/'
      || url.startsWith('/api/public'))
      return;
    try {
      const payload = await request.jwtVerify();
      request.userId = payload.userId;
      request.username = payload.username;
    }
    catch  {
      console.log("No token provided");
      reply.code(401).send({ error: 'No token provided' });
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
