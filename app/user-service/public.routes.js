import fastifyStatic from '@fastify/static'
import path from 'path';
import createError from 'http-errors';
import notificationLiveStream from './notificationLiveStream.js'
import gameEndPoints from './game.match.js'
import leaderBord from './leaderboard.js'
import statisticRoutes from './user.statistic.js';
import matchHistory from './matchs.history.js';





export async function publicRoutes(fastify) {

  const __dirname = import.meta.dirname;

  const staticOps = {
    root: path.join(__dirname, 'static'),
    prefix: '/public/'
  };

  fastify.register(fastifyStatic, staticOps);
  fastify.register(notificationLiveStream);

  fastify.register(gameEndPoints);

  // fastify.post('/user/createNewUser', createNewUser);
  // fastify.put("/user/blockAndunblock-friend/:id", blockAndunblockFriend);

  fastify.get("/user/test", async (req, reply) => {
    const data = fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
    return data;
  })

  // fastify.get('/user/chat/profile/:id', chatProfileHandler);
  fastify.register(leaderBord);
  fastify.register(statisticRoutes);
  fastify.register(matchHistory);
  fastify.get("/user/all-users", async (req, reply) => {
    const data = fastify.db.prepare("SELECT * FROM userInfo").all();
    return data;
  })
}
