import fastifyStatic from '@fastify/static'
import path from 'path';
import notificationLiveStream from './notificationLiveStream.js'

export async function publicRoutes(fastify) {

  const __dirname = import.meta.dirname;

  const staticOps = {
    root: path.join(__dirname, 'static'),
    prefix: '/public/'
  };

  fastify.register(fastifyStatic, staticOps);
  fastify.register(notificationLiveStream);

  // fastify.get("/user/test", async (req, reply) => {
  //   const data = fastify.db.prepare("SELECT userRequester, userReceiver, blocker_id, status FROM friendships").all();
  //   return data;
  // })

  // fastify.get("/user/all-users", async (req, reply) => {
  //   const data = fastify.db.prepare("SELECT * FROM userInfo").all();
  //   return data;
  // })
}
