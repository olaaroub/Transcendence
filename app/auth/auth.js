import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import vault from 'node-vault';
import createError from 'http-errors';

import routes from './routes.js';
import dbconfig from './database.config.js'

async function getSecrets(logger) {
  try {

    const vaultPath = process.env.VAULT_SECRET_PATH

    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.AUTH_SERVICE_TOKEN
    };

    const vaultClient = vault(options);
    logger.info(`reading secrets from: ${vaultPath}`);
    const { data } = await vaultClient.read(vaultPath);

    return {
      jwtSecret: data.data.jwt_secret,
      cookieSecret: data.data.cookie_secret,
      googleId: data.data.google_client_id,
      googleSecret: data.data.google_client_secret,
      githubId: data.data.github_client_id,
      githubSecret: data.data.github_client_secret,
      intraId: data.data.intra_client_id,
      intraSecret: data.data.intra_client_secret
    };

  } catch (err) {
    logger.error({ msg: "CRITICAL: Error fetching secret from Vault", err: err });
    process.exit(1);
  }
}



async function main() {

  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      base: {
        service: 'auth-service',
        env: process.env.NODE_ENV || 'development'
      },

      redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password']
    }
  });

  fastify.setErrorHandler(function (error, request, reply) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      request.log.error({
        msg: "Code crash hhh",
        err: error,
        reqId: request.id
      });
    }
    else {
      request.log.warn({
        msg: error.message,
        code: statusCode,
        reqId: request.id
      });
    }

    const response = { // response for the front end
      success: false,
      error: statusCode >= 500 ? "Internal Server Error" : error.message
    };
    reply.status(statusCode).send(response);
  });



  try {
    fastify.log.info("Auth service is starting...");
    const secrets = await getSecrets(fastify.log);
    fastify.log.info("Secrets fetched successfully");

    await fastify.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    });

    await fastify.register(fastifyJwt, {
      secret: secrets.jwtSecret
    });


    const db = await dbconfig();
    fastify.decorate('db', db);



    fastify.register(routes, {
      prefix: '/api',
      secrets: secrets
    });

    await fastify.listen({
      port: process.env.PORT,
      host: process.env.HOST
    });

  }

  catch (err) {
    fastify.log.error({ msg: "Starting failed", err: err });
    process.exit(1)
  }
}

main();
