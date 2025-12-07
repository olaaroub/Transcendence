// const path = require('path');
import path from 'path';
// import fastifyStatic from '@fastify/static'
import local_auth from './local.authentication.js'
import googlea_auth from './google.authentication.js'
import github_auth from './github.authentication.js'
import intra_auth from './42intra.authentication.js'
// import notificationLiveStream from '../user-service/notificationLiveStream.js'
// import statistic from '../user-service/user.statistic.js'
// import leaderBord from '../user-service/leaderBord.js'
import { fileURLToPath } from 'url';

async function publicRoutes(fastify, opts) {
  // const __dirname = import.meta.dirname;
  // const staticOps = {
  //     root: path.join(__dirname, '../static'),
  //     prefix: '/public/'
  //   };

  const secretOpts = {
    secrets: opts.secrets
  };
  // fastify.register(fastifyStatic , staticOps);
  fastify.register(local_auth);
  fastify.register(googlea_auth, secretOpts);
  fastify.register(github_auth, secretOpts);
  fastify.register(intra_auth, secretOpts);
  //   fastify.get("/test", async (req, reply) => {
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
  /*
  body {
    friend_id: 2,
    block: true / false,
  }
   */
  // fastify.put("/users/blockAndunblock-friend/:id", async (req, reply) => {
  //   try
  //   {
  //     const id = req.params.id;
  //     const friend_data = req.body;

  //     if (friend_data.block)
  //       await fastify.db.prepare("UPDATE friendships SET status = ?, blocker_id = ? WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["BLOCKED", id,id, friend_data.friend_id, id, friend_data.friend_id]);
  //     else
  //         await fastify.db.prepare("UPDATE friendships SET status = ?, blocker_id = NULL WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)").run(["ACCEPTED", id, friend_data.friend_id, id, friend_data.friend_id]);
  //     reply.code(200).send("success");
  //   }
  //   catch (err)
  //   {
  //     console.log(err);
  //     reply.code(200).send("error");

  //   }

  // })
}

// module.exports = publicRoutes;
export default publicRoutes;