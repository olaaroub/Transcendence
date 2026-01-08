import settings from './settings.js'
import profileAvatar from './profileAvatar.js'
import search_bar from './search_bar.js'
import friendsReceiver from './friendsReceiver.js'
import friendsRequester from './friendsRequester.js'
import deleteAccount from './deleteAccount.js'
import block_unblockFriend from './user-block.js'
import leaderBord from './leaderboard.js'
import statisticRoutes from './user.statistic.js';
import matchHistory from './matchs.history.js';
// import userStatistic from './user.statistic.js'

import createError from 'http-errors';

async function JwtHandler(request, reply) {
  try {

    const payload = await request.jwtVerify();

    request.userId = payload.id;
    request.username = payload.username;

    request.log.debug({ userId: payload.id, username: payload.username }, "JWT Token is valid!");
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
  fastify.register(block_unblockFriend);
  fastify.register(leaderBord);
  fastify.register(statisticRoutes);
  fastify.register(matchHistory);
  // fastify.register(userStatistic);
}

export default privateRoutes;
