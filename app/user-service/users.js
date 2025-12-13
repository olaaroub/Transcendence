import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import websocket from '@fastify/websocket';
import vault from 'node-vault';
import createError from 'http-errors';

import dbconfig from './database.config.js';
import privateRoutes from './private.routes.js';
import { publicRoutes } from './public.routes.js';

async function getJwtSecret(logger) {
  try {
    const vaultPath = process.env.VAULT_SECRET_PATH;
    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.USER_SERVICE_TOKEN
    };

    const vaultClient = vault(options);
    logger.info(`Reading secrets from: ${vaultPath}`);
    const { data } = await vaultClient.read(vaultPath);

    return {
      jwtSecret: data.data.jwt_secret,
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
        service: 'user-service',
        env: process.env.NODE_ENV || 'development'
      },
      redact: ['req.headers.authorization', 'req.headers.cookie']
    }
  });

  fastify.setErrorHandler(function (error, request, reply) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      request.log.error({
        msg: "System Crash",
        err: error,
        reqId: request.id
      });
    } else {
      request.log.warn({
        msg: error.message,
        code: statusCode,
        reqId: request.id
      });
    }

    const response = {
      success: false,
      error: statusCode >= 500 ? "Internal Server Error" : error.message
    };
    reply.status(statusCode).send(response);
  });

  try {
    fastify.log.info("Starting User Service...");
    const secrets = await getJwtSecret(fastify.log);
    fastify.log.info("Secrets fetched successfully");

    await fastify.register(fastifyJwt, {
      secret: secrets.jwtSecret
    });

    await fastify.register(websocket);

    await fastify.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    });

    const db = await dbconfig();
    fastify.decorate('db', db);

    const sockets = new Map();
    fastify.decorate('sockets', sockets);

    fastify.register(privateRoutes, { prefix: '/api' });
    fastify.register(publicRoutes, { prefix: '/api' });

    await fastify.listen({
      port: process.env.PORT || 3002,
      host: process.env.HOST || '0.0.0.0'
    });

  } catch (err) {
    fastify.log.error({ msg: "Startup failed", err: err });
    process.exit(1);
  }
}

main();