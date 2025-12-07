import settings from './settings.js'
import profileAvatar from './profileAvatar.js'
import search_bar from './search_bar.js'
import friendsReceiver from './friendsReceiver.js'
import friendsRequester from './friendsRequester.js'
import deleteAccount from './deleteAccount.js'


async function JwtHandler(request, reply) {

  try {

    const payload = await request.jwtVerify();

    request.userId = payload.id;
    request.username = payload.username;
  }
  catch (err) {
    console.log("No token provided or invalid token");
    reply.code(401).send({ error: 'Unauthorized: No valid token provided' });
  }
}

async function privateRoutes(fastify) {
  fastify.addHook('preHandler', JwtHandler);
  fastify.register(settings);
  fastify.register(profileAvatar);
  fastify.register(search_bar);
  fastify.register(friendsReceiver);
  fastify.register(friendsRequester);
  fastify.register(deleteAccount);
  // fastify.register(require('./user.statistic'));
}

// module.exports = privateRoutes;
export default privateRoutes;

