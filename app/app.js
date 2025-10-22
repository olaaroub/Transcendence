const fastify = require('fastify')( {logger: true} )
const routes = require('./routes/users');
const creatTable = require('./config/database');
const fastifyCors = require('@fastify/cors');

const start = async () => {

    const db = await creatTable();


    await fastify.register(fastifyCors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    fastify.decorate('db', db);
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
