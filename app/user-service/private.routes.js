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
/*
  create new user body structure:
  {
    user_id,
    username,
    avatar_url;
  }
*/
async function createNewUser(req, reply)
{
    const newUserData = req.body;
    try {
      console.log(newUserData);
      if (newUserData.avatar_url)
        this.db.prepare(`INSERT INTO userInfo(user_id, username, avatar_url) VALUES(?, ?, ?)`).run([newUserData.user_id, newUserData.username, newUserData.avatar_url]);
      else
        this.db.prepare(`INSERT INTO userInfo(user_id, username) VALUES(?, ?)`).run([newUserData.user_id, newUserData.username]);
      reply.code(200).send({message: "user created successfully", ok: true});
    }
    catch (err)
    {
      console.log(err)
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
        reply.code(409).send({message: "this user alredy exists !", ok: false});
      else
        reply.code(500).send({message: "intrenal server error", ok: false});
    }
}

async function privateRoutes(fastify) {
  // fastify.addHook('preHandler', JwtHandler);
  fastify.register(settings);
  fastify.register(profileAvatar);
  fastify.register(search_bar);
  fastify.register(friendsReceiver);
  fastify.register(friendsRequester);
  // fastify.register(deleteAccount);
  fastify.post('/user/createNewUser', createNewUser);
  // fastify.register(require('./user.statistic'));
}

// module.exports = privateRoutes;
export default privateRoutes;

