const path = require('path');
async function publicRoutes(fastify)
{
    const staticOps = {
        root: path.join(__dirname, '../static'),
        prefix: '/public/'
      };

    fastify.register(require('@fastify/static') , staticOps);
    fastify.register(require('./local.authentication'));
    fastify.register(require('./google.authentication'));
    fastify.register(require('./github.authentication'));
    fastify.register(require('./42intra.authentication'));
    fastify.register(require('./notificationLiveStream'));
    fastify.register(require('./user.statistic'));
    fastify.get("/test", async (req, reply) => {
      try
      {
          const data = await fastify.db.all("SELECT userRequester, userReceiver, status FROM friendships");
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
        await fastify.db.run("UPDATE friendships SET status = ? WHERE userRequester = ? AND userReceiver = ?", ["BLOCKED", id, friend_data.friend_id]);
      else
      await fastify.db.run("UPDATE friendships SET status = ? WHERE userRequester = ? AND userReceiver = ?", ["ACCEPTED", id, friend_data.friend_id]);
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