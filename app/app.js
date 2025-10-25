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

<<<<<<< HEAD
    fastify.addHook('onRequest', async (request, reply) => {
      if (request.routerPath === '/login' || request.routerPath === '/signUp')
          return ;
      try
      {
        await request.jwtVerify();
      } 
      catch {
        console.log("No token provided");
        reply.code(401).send({ error: 'No token provided' });
      }
=======
    fastify.addHook('onRequest', (request, reply, done) => {
      // const token = "aiman";
      // request.user = token;
      if (request.routerPath === '/login' || request.routerPath === '/signUp')
          return ;
      done();
>>>>>>> 0d78964 (fix the error of  cros policy ( I allowed all ips to request my backend ))
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
