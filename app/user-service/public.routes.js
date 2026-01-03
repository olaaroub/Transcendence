import fastifyStatic from '@fastify/static'
import path from 'path';
import createError from 'http-errors';
import notificationLiveStream from './notificationLiveStream.js'
import gameEndPoints from './game.match.js'
import leaderBord from './leaderboard.js'
import statisticRoutes from './user.statistic.js';

async function createNewUser(req, reply) {
  const newUserData = req.body;
  if (!newUserData.user_id || !newUserData.username) {
    throw createError.BadRequest("Invalid user data: user_id and username are required");
  }

  const bio = newUserData.bio || 'Hello there i am using Pong game!';
  const avatar_url = newUserData.avatar_url || '/public/Default_pfp.jpg';


  try {
    // if (newUserData.avatar_url) {

      this.db.prepare(`INSERT INTO userInfo(id, username, avatar_url, bio) VALUES(?, ?, ?, ?)`)
        .run([newUserData.user_id, newUserData.username, avatar_url, bio]);
    // } else {
    //   this.db.prepare(`INSERT INTO userInfo(id, username, bio) VALUES(?, ?, ?)`)
    //     .run([newUserData.user_id, newUserData.username, bio]);
    // }

    req.log.info({ userId: newUserData.user_id, username: newUserData.username }, "New user synced from Auth Service");

    if (this.customMetrics?.totalUsersGauge) {
      this.customMetrics.totalUsersGauge.inc();
    }

    reply.code(201).send({ message: "User created successfully", ok: true });
  }
  catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      req.log.warn({ userId: newUserData.user_id }, "Duplicate user sync attempt (already exists)");
      throw createError.Conflict("This record already exists");
    }
    throw err;
  }
}

async function blockAndunblockFriend(req, reply) {
  const id = req.params.id;
  const { friend_id, block } = req.body;

  if (!friend_id)
    throw createError.BadRequest("Friend ID is required");

  const friendshipsData = this.db.prepare("SELECT status, blocker_id FROM friendships WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
    .get([id, friend_id, id, friend_id]);

  if (!friendshipsData || friendshipsData.status === 'BLOCKED' && String(friendshipsData.blocker_id) !== String(id) && block)
  {
    req.log.info({ userId: id, targetId: friend_id }, "User trying to block a friend who already blocked them");
    reply.code(200).send({ success: true });
  }

  if (!friendshipsData || (friendshipsData.status === 'BLOCKED' && String(friendshipsData.blocker_id) !== String(id) && !block))
    throw createError.BadRequest("You trying to unblock a friend who blocked you");

  if (!friendshipsData || (friendshipsData.status === 'BLOCKED' && block) || friendshipsData.status === 'PENDING')
    throw createError.NotFound("Friendship not found or not in a valid state for this operation");


  if (block) {
    const info = this.db.prepare("UPDATE friendships SET status = ?, blocker_id = ? WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
      .run(["BLOCKED", id, id, friend_id, id, friend_id]);

    if (info.changes === 0) throw createError.NotFound("Friendship not found");

    req.log.info({ userId: id, targetId: friend_id }, "User BLOCKED a friend");
    this.customMetrics.friendCounter.inc({ action: 'blocked' });
  }
  else {
    const info = this.db.prepare("DELETE FROM friendships WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
      .run([id, friend_id, id, friend_id]); // delete it

    if (info.changes === 0) throw createError.NotFound("Friendship not found or not blocked");

    req.log.info({ userId: id, targetId: friend_id }, "User UNBLOCKED a friend");
    this.customMetrics.friendCounter.inc({ action: 'unblocked' });
  }

  reply.code(200).send({ success: true });
}


async function chatProfileHandler(req, reply)
{
    const id = req.params.id;

    const userData = this.db.prepare('SELECT username, avatar_url FROM userInfo WHERE id = ?').get(id);

    console.log(userData)
    if (!userData)
        createError.NotFound("this user not found");

    return userData
}


export async function publicRoutes(fastify) {

  const __dirname = import.meta.dirname;

  const staticOps = {
    root: path.join(__dirname, 'static'),
    prefix: '/public/'
  };

  fastify.register(fastifyStatic, staticOps);
  fastify.register(notificationLiveStream);

  fastify.register(gameEndPoints);

  fastify.post('/user/createNewUser', createNewUser);
  fastify.put("/user/blockAndunblock-friend/:id", blockAndunblockFriend);

  fastify.get("/user/test", async (req, reply) => {
    const data = fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
    return data;
  })

  fastify.get('/user/chat/profile/:id', chatProfileHandler);
  fastify.register(leaderBord);
  fastify.register(statisticRoutes);
  fastify.get("/user/all-users", async (req, reply) => {
    const data = fastify.db.prepare("SELECT * FROM userInfo").all();
    return data;
  })
}
