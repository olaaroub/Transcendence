// import lacalauth from './local.authentication.js'
import routes from  './routes.js';
import dbconfig from './database.config.js'
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import Fastify from 'fastify';

async function main()
{
  const fastify = Fastify({ logger: false });
  // await fastify.register(fastifyCors, {
  //   origin: '*',
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   allowedHeaders: ['Access-Control-Allow-Origin']
  // });
  // fastify.register(fastifyJwt, {
  //   secret: secrets.jwtSecret
  // });
  fastify.register(fastifyJwt, {
    secret: "ejnhbfvbdfhifdfsvbhsvbhedeu283848wdfsdvhbdhbfbhsdw478"
  });
  try {
        const db = await dbconfig();
        fastify.decorate('db', db);
        const secretOpts = {
          githubId: "dd",
          githubSecret: "fds",
          cookieSecret: "fdes",
          googleId: "ddfd",
          googleSecret: "fdfd",
          intraId: "fdf",
          intraSecret: "fdfd"
        } 
        fastify.register(routes , {
          prefix: '/api',
          secrets: secretOpts
        });
        fastify.listen({
          port: process.env.PORT || 5173,
          host: process.env.HOST || '0.0.0.0'
        });
        console.log(`Server listening on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 5173}`);
      } catch (err) {
        fastify.log.error(err)
        process.exit(1)
      }
}

main();
