const fastify = require('fastify')( {logger: false} )
const routes = require('./routes/mainRoutes');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');


const start = async () => {

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

    fastify.addHook('preHandler', async (request, reply) => {
      console.log(request.routeOptions.url);
      //console.log(request.)
      if (request.routeOptions.url === '/login' || request.routeOptions.url === '/signUp' || request.routeOptions.url.startsWith('/public'))
      {
        console.log("in login");
        return ;
      }
      try
      {
        console.log("in try");
        await request.jwtVerify();
      } 
      catch {
        // console.log(err);
        console.log("No token provided");
        reply.code(401).send({ error: 'No token provided' });
      }

    });

    await routes(fastify);
    
    try {
        fastify.listen({ port: 3000 });
    } catch(err)
    {
      fastify.log.error(err)
      process.exit(1)
    }
}

start();
// console.log ("ddd");
