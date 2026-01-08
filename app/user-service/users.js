import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import websocket from '@fastify/websocket';
import vault from 'node-vault';
import createError from 'http-errors';
import fastifyMetrics from 'fastify-metrics';
import microServicesRoutes from './micro.services.routes.js';
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
        service_name: 'user-service',
        env: process.env.NODE_ENV || 'development'
      },
      redact: ['req.headers.authorization', 'req.headers.cookie']
    }
  });

  await fastify.register(fastifyMetrics, {
    endpoint: '/metrics',
    defaultMetrics: { enabled: true }
  });

  const totalUsersGauge = new fastify.metrics.client.Gauge({
    name: 'app_users_total',
    help: 'Total number of registered users'
  });

  const onlineUsersGauge = new fastify.metrics.client.Gauge({
    name: 'app_users_online',
    help: 'Number of users currently connected via websocket'
  })

  const friendCounter = new fastify.metrics.client.Counter({
    name: 'user_friendship_actions_total',
    help: 'Total number of friendship actions',
    labelNames: ['action']
  });

  const friendAction = ['sent', 'accepted', 'rejected', 'blocked', 'unblocked'];
  friendAction.forEach(action =>{
    friendCounter.labels(action).inc(0);
  });

  const searchCounter = new fastify.metrics.client.Counter({
    name: 'user_searches_total',
    help: 'Total number of user searches performed'
  });

  fastify.decorate('customMetrics', {
    friendCounter,
    searchCounter,
    totalUsersGauge,
    onlineUsersGauge,
  });

  fastify.setErrorHandler(function (error, request, reply) {
    let statusCode = error.statusCode || 500;

    let userMessage = error.message;


    if (error.validation) {
      statusCode = 400;

      userMessage = userMessage
        .replace('body/', '')
        .replace('querystring/', '')
        .replace('params/', '')
        .replace('headers/', '');

      userMessage = userMessage.charAt(0).toUpperCase() + userMessage.slice(1);
    }


    if (statusCode >= 500) {
      request.log.error({
        msg: "System crash",
        err: error,
        reqId: request.id
      });
      userMessage = "Internal Server Error";
    } else {
      request.log.warn({
        msg: "Client Error",
        error: error.message,
        code: statusCode,
        reqId: request.id
      });
    }

    const response = {
      success: false,
      error: userMessage
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

    try {
      const countResult = db.prepare('SELECT COUNT(id) as count FROM userInfo').get(); //ohammou dir lia query tat3tik users li kaynin kamlin
      if (countResult) {
        totalUsersGauge.set(countResult.count);
        fastify.log.info(`Metrics initialized: ${countResult.count} total users`);
      }
    } catch (dbErr) {
      fastify.log.error("Failed to initialize total user metric", dbErr);
    }

    fastify.log.info({ dbPath: process.env.DATABASE_PATH }, "Database connected successfully");

    const sockets = new Map();
    fastify.decorate('sockets', sockets);

    fastify.register(privateRoutes, { prefix: '/api' });
    fastify.register(publicRoutes, { prefix: '/api' });
    fastify.register(microServicesRoutes, { prefix: '/api' })

    await fastify.listen({
      port: process.env.PORT,
      host: process.env.HOST
    });

  } catch (err) {
    fastify.log.error({ msg: "Startup failed", err: err });
    process.exit(1);
  }
}

main();