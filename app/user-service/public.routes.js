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
}
