const fastify = require('fastify')( {logger: true} )
const routes = require('./routes/users');
const creatTable = require('./config/database');

const start = async () => {

    const db = await creatTable();

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
