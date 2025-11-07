const fastify = require('fastify')( {logger: true} )
const routes = require('./routes/mainRoutes');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');


async function start() 
{

    const db = await creatTable();


    await fastify.register(fastifyCors, {
      origin: true, // ba9i khasni npisifi frontend ip
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      // allowedHeaders: ['Content-Type', 'Authorization'],
    });

    fastify.register(fastifyJwt, {
      secret: 'supersecret'
    });

    fastify.decorate('db', db);
    fastify.register(require('@fastify/websocket'));
    // fastify.register(require('@fastify/websocket'))
    // fastify.addHook('preHandler', async (request, reply) => {
    //   if (request.routeOptions.url === '/login' || request.routeOptions.url === '/signUp' || request.routeOptions.url === '/'
    //     || request.routeOptions.url.startsWith('/public'))
    //     return ;
    //   try
    //   {
    //     await request.jwtVerify();
    //   } 
    //   catch {
    //     console.log("No token provided");
    //     reply.code(401).send({ error: 'No token provided' });
    //   }

    // });

    fastify.register(routes);
    
    try {
        fastify.listen({ port: 3000 });
    } catch(err)
    {
      fastify.log.error(err)
      process.exit(1)
    }
}

start();
