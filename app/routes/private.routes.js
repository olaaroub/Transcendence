
async function JwtHandler(request, reply)
{

    try {

      const payload = await request.jwtVerify();

      request.userId = payload.userId;
      request.username = payload.username;
    }
    catch (err) {
      console.log("No token provided or invalid token");
      reply.code(401).send({ error: 'Unauthorized: No valid token provided' });
    }
}

async function privateRoutes(fastify)
{
    fastify.addHook('preHandler', JwtHandler);
    fastify.register(require('./settings'));
    fastify.register(require('./images'));
    fastify.register(require('./search'));
    fastify.register(require('./friendsReceiver'));
    fastify.register(require('./friendsRequester'));
    fastify.register(require('./simpleWebSocket'));
    fastify.register(require('./deleteAccount'));
}

module.exports = privateRoutes;