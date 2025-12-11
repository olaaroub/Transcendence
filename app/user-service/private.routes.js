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
  }
  catch (err) {
    console.log("No token provided or invalid token");
    reply.code(401).send({ error: 'Unauthorized: No valid token provided' });
  }
}
/*
  create new user body structure:
  {
    user_id,
    username,
    avatar_url;
  }
*/


async function privateRoutes(fastify) {
  // fastify.addHook('preHandler', JwtHandler);
  fastify.register(settings);
  fastify.register(profileAvatar);
  fastify.register(search_bar);
  fastify.register(friendsReceiver);
  fastify.register(friendsRequester);
  fastify.register(deleteAccount);
  fastify.register(userStatistic);
  // fastify.post('/user/createNewUser', createNewUser);
  // fastify.put("/user/blockAndunblock-friend/:id", blockAndunblockFriend);
  //     fastify.get("/test", async (req, reply) => {
  //     try
  //     {
  //         const data = await fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
  //         reply.code(200).send(data);
  //     }
  //     catch (err)
  //     {
  //         reply.code(500).send({success: false});
  //     }
  // })
}

// module.exports = privateRoutes;
export default privateRoutes;

