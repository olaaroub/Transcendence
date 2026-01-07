
import createError from 'http-errors';
import gameEndPoints from './game.match.js';
async function chatProfileHandler(req, reply)
{
    const id = req.params.id;

    const userData = this.db.prepare('SELECT username, avatar_url FROM userInfo WHERE id = ?').get(id);

    console.log(userData)
    if (!userData)
        createError.NotFound("this user not found");

    return userData
}

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

export default async function microServicesRoutes(fastify)
{
    fastify.get('/user/chat/profile/:id', chatProfileHandler);
    fastify.post('/user/createNewUser', createNewUser);
    fastify.register(gameEndPoints);
}