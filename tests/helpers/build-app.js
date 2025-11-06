const fastify = require('fastify');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const routes = require('../../app/routes/mainRoutes');

/**
 * Build a Fastify app instance for testing
 * @param {Object} db - Mock database instance
 * @param {Object} options - Optional Fastify options
 * @returns {Object} Fastify instance
 */
async function buildApp(db, options = {}) {
    const app = fastify({ logger: false, ...options });

    // Register CORS
    await app.register(fastifyCors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    // Register JWT
    await app.register(fastifyJwt, {
        secret: 'supersecret'
    });

    // Decorate with database
    app.decorate('db', db);

    // Add preHandler hook (skip JWT for login/signUp/public)
    app.addHook('preHandler', async (request, reply) => {
        if (request.routeOptions.url === '/login' ||
            request.routeOptions.url === '/signUp' ||
            request.routeOptions.url.startsWith('/public')) {
            return;
        }
        try {
            await request.jwtVerify();
        } catch {
            reply.code(401).send({ error: 'No token provided' });
        }
    });

    // Register routes
    await app.register(routes);

    return app;
}

module.exports = buildApp;
