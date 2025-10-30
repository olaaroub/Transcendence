const path = require('path');
const fs = require('fs');
const fastify_static = require('@fastify/static');
const fastifyMultipart = require('@fastify/multipart');
// const fastify = require('fastify');

// const search = async (fastify) =>
//   {
//     fastify.get(`users/search`,   (req, reply) => {
//       //  console.log(`query : ${req.query}`);
//       //  reply.send({username: "ana"});
//     })
//   }

const getProfileImages = async (fastify) => {
    fastify.register(fastify_static , {
        root: path.join(__dirname, '../../static'),
        prefix: '/public/',
    });
    fastify.get(`/users/:id/image`, async (req, reply) => {
      const id = req.params.id;
      const img = await fastify.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
      reply.code(200).send(img.profileImage);
    });
  }



const modifyAvatar = async (fastify) => {
    await fastify.register(fastifyMultipart);
    fastify.put(`/users/:id/image`, async (req, reply) => {
        const id = req.params.id;
        const data = await req.file();
        const file_name =  '_' + data.filename;

        const file_path = path.join(__dirname, '../../static', file_name);
        await fs.promises.writeFile(file_path, await data.toBuffer());

        const imageUri = `http://127.0.0.1:3000/public/${file_name}`;

        await fastify.db.run("UPDATE infos SET profileImage = ?", [imageUri]);
        reply.code(201).send({success: true, message: "your update the profile image successfully"});
    });
}

module.exports =  {getProfileImages, modifyAvatar};