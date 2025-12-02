const path = require('path');
async function publicRoutes(fastify, opts)
{
    const staticOps = {
        root: path.join(__dirname, '../static'),
        prefix: '/public/'
      };
    
    const secretOpts = {
      secrets: opts.secrets
    };

    fastify.register(require('@fastify/static') , staticOps);
    fastify.register(require('./local.authentication'));
    fastify.register(require('./google.authentication'), secretOpts);
    fastify.register(require('./github.authentication'), secretOpts);
    fastify.register(require('./42intra.authentication'), secretOpts);
    fastify.register(require('./notificationLiveStream'));
    fastify.register(require('./user.statistic'));
    fastify.register(require('./leaderBord'));
    fastify.get("/test", async (req, reply) => {
      try
      {
          const data = await fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
          reply.code(200).send(data);
      }
      catch (err)
      {
          reply.code(500).send({success: false});
      }
  })
  /* 
  body {
    friend_id: 2,
    block: true / false,
  }
   */
  fastify.put("/users/blockAndunblock-friend/:id", async (req, reply) => {
    try
    {
      const id = req.params.id;
      const friend_data = req.body;

      if (friend_data.block)
        await fastify.db.prepare("UPDATE friendships SET status = ?, blocker_id = ? WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["BLOCKED", id,id, friend_data.friend_id, id, friend_data.friend_id]);
      else
          await fastify.db.prepare("UPDATE friendships SET status = ?, blocker_id = NULL WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["ACCEPTED", id, friend_data.friend_id, id, friend_data.friend_id]);
      reply.code(200).send("success");
    }
    catch (err)
    {
      console.log(err);
      reply.code(200).send("error");

    }

  })
}

module.exports = publicRoutes;