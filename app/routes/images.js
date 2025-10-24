const path = require('path');
const fastify_static = require('@fastify/static');
const fastify = require('fastify');

const getProfileImages = async (fastify) => {

    console.log(__dirname);
    fastify.register(fastify_static , {
        root: path.join(__dirname, '../../static'),
        prefix: '/public/',
    });
    fastify.get(`/users/:id/image`, async (req, reply) => {
      const id = req.params.id;
      const img = await fastify.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
      console.log("/public/" + img.profileImage);
      reply.send(`http://127.0.0.1:3000/public/${img.profileImage}`);
      // return reply.sendFile(img.profileImage);
    });
  }

const modifyAvatar = async (fastify) => {
    fastify.put(`/users/:id/image`, async (req, reply) => {
        const id = req.params.id;
        await fastify.db.run("UPDATE infos SET profileImage = ?", );
    });
}

module.exports =  {getProfileImages};