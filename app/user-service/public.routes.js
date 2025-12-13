import fastifyStatic from '@fastify/static'
import path from 'path';
import notificationLiveStream from './notificationLiveStream.js'

async function createNewUser(req, reply)
{
    const newUserData = req.body;
    try {
      console.log(newUserData);
      if (newUserData.avatar_url)
        this.db.prepare(`INSERT INTO userInfo(id, username, avatar_url) VALUES(?, ?, ?)`).run([newUserData.user_id, newUserData.username, newUserData.avatar_url]);
      else
        this.db.prepare(`INSERT INTO userInfo(id, username) VALUES(?, ?)`).run([newUserData.user_id, newUserData.username]);
      reply.code(200).send({message: "user created successfully", ok: true});
    }
    catch (err)
    {
      if (err.code === SQLITE_CONSTRAINT_UNIQUE)
        throw createError.Conflict("This record already exists");
      throw err;
    }
}

/*
  body {
    friend_id: 2,
    block: true / false,
  }
*/

async function blockAndunblockFriend(req, reply)
{
  const id = req.params.id;
  const friend_data = req.body;

  if (friend_data.block)
      this.db.prepare("UPDATE friendships SET status = ?, blocker_id = ? WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["BLOCKED", id,id, friend_data.friend_id, id, friend_data.friend_id]);
  else
      this.db.prepare("UPDATE friendships SET status = ?, blocker_id = NULL WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["ACCEPTED", id, friend_data.friend_id, id, friend_data.friend_id]);
  reply.code(201).send({success: true});

}

export async function  publicRoutes(fastify)
{

    const __dirname = import.meta.dirname;
    console.log(path.join(__dirname, 'static'))
    const staticOps = {
      root: path.join(__dirname, 'static'),
      prefix: '/public/'
    };
    fastify.register(fastifyStatic , staticOps);
    fastify.register(notificationLiveStream);
    fastify.post('/user/createNewUser', createNewUser);
    fastify.put("/user/blockAndunblock-friend/:id", blockAndunblockFriend);

    fastify.get("/user/test", async (req, reply) => {
      const data = fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
      return data;
    })
    fastify.get("/user/all-users", async (req, reply) => {

			const data = fastify.db.prepare("SELECT * FROM userInfo").all();
			return data;
    })
}