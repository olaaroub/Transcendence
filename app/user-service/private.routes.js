import settings from './settings.js'
import profileAvatar from './profileAvatar.js'
import search_bar from './search_bar.js'
import friendsReceiver from './friendsReceiver.js'
import friendsRequester from './friendsRequester.js'
import deleteAccount from './deleteAccount.js'
import userStatistic from './user.statistic.js'

async function JwtHandler(request, reply) {
  try {

    const payload = await request.jwtVerify();

    request.userId = payload.id;
    request.username = payload.username;

    request.log.debug({ userId: payload.id, username: payload.username }, "JWT Verified");
  }
  catch (err) {
    request.log.warn("Unauthorized access attempt (Invalid or missing token)");
    throw createError.Unauthorized("Invalid or missing token");
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
  fastify.register(userStatistic);
}

export default privateRoutes;
