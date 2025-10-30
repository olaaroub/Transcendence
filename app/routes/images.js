const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fastify_static = require('@fastify/static');
const fastifyMultipart = require('@fastify/multipart');
const { URL } = require('url');
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
        try {
            const data = await fastify.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
            const imgpath = path.basename(new URL(data.profileImage).pathname);
            console.log(path.join(__dirname, '../../static', imgpath));
            if (imgpath != `Default_pfp.jpg`)
              await fs.promises.unlink(path.join(__dirname, '../../static', imgpath));
        } catch (err)
        {
          reply.code(500).send({success: false, message: err});
          console.log(err);
        }
        const data = await req.file();
        const ext = path.extname(data.filename);
        const file_name = uuidv4() + ext;

        const file_path = path.join(__dirname, '../../static', file_name);
        await fs.promises.writeFile(file_path, await data.toBuffer());

        const imageUri = `http://127.0.0.1:3000/public/${file_name}`;

        await fastify.db.run("UPDATE infos SET profileImage = ?  WHERE user_id = ?", [imageUri, id]);
        reply.code(201).send({success: true, message: "your update the profile image successfully"});
    });
}

function deleteAvatar(fastify)
{
  fastify.delete('/users/:id/image', async (req, reply) => {
    const id = req.params.id;
    try {
      const data = await fastify.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
      const imgpath = path.basename(new URL(data.profileImage).pathname);
      console.log(path.join(__dirname, '../../static', imgpath));
      if (imgpath == `Default_pfp.jpg`)
          reply.code(401).send({success: false, message: "can't delete the default img"});
      await fs.promises.unlink(path.join(__dirname, '../../static', imgpath));
      await fastify.db.run("UPDATE infos SET profileImage = ? WHERE user_id = ?", ["http://127.0.0.1:3000/public/Default_pfp.jpg", id]);
      reply.code(201).send({success: true, message: "your delete the profile image successfully"});
    } catch (err) {
      reply.code(500).send({success: false, message: err});
      console.log(err);
    }
  })
}

module.exports =  {getProfileImages, modifyAvatar, deleteAvatar};