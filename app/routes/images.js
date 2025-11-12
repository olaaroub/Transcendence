const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fastify_static = require('@fastify/static');
const fastifyMultipart = require('@fastify/multipart');



async function getProfileImages(req, reply)
{
  try
  {
    const id = req.params.id;
    const img = await this.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
    reply.code(200).send(img.profileImage);
  }
  catch (err)
  {
    console.log(err);
    reply.code(500).send({success: false, message: "internal server error"});
  }
}



async function modifyAvatar(req, reply)
{
  try
  {
    const id = req.params.id;
    const data = await this.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
    const imgpath = path.basename(data.profileImage);
    if (imgpath != `Default_pfp.jpg`)
      await fs.promises.unlink(path.join(__dirname, '../static', imgpath));
    const datafile = await req.file();
    const ext = path.extname(datafile.filename);
    const file_name = uuidv4() + ext;

    const file_path = path.join(__dirname, '../static', file_name);
    await fs.promises.writeFile(file_path, await datafile.toBuffer());

    const imageUri = `/public/${file_name}`;

    await this.db.run("UPDATE infos SET profileImage = ?  WHERE user_id = ?", [imageUri, id]);
    reply.code(201).send({success: true, message: "your update the profile image successfully"});
  }
  catch (err)
  {
          reply.code(500).send({success: false, message: err});
          console.log(err);
  }
}

async function deleteAvatar(req, reply)
{
  try
  {
    const id = req.params.id;
    const data = await this.db.get("SELECT profileImage FROM infos WHERE user_id = ?", id);
    const imgpath = path.basename(data.profileImage);
    console.log(path.join(__dirname, '../static', imgpath));
    if (imgpath == `Default_pfp.jpg`)
      reply.code(401).send({success: false, message: "can't delete the default img"});
    else
    {
      await fs.promises.unlink(path.join(__dirname, '../static', imgpath));
      await this.db.run("UPDATE infos SET profileImage = ? WHERE user_id = ?", ["/public/Default_pfp.jpg", id]);
      reply.code(201).send({success: true, message: "your delete the profile image successfully"});
    }
  }
  catch (err) {
    reply.code(500).send({success: false, message: err});
    console.log(err);
  }
}

async function routes (fastify)
{
  await fastify.register(fastify_static , {
    root: path.join(__dirname, '../static'),
    prefix: '/public/',
  });
  await fastify.register(fastifyMultipart);
  fastify.delete('/users/:id/settings-avatar', deleteAvatar);
  fastify.put(`/users/:id/settings-avatar`, modifyAvatar);
  fastify.get(`/users/:id/settings-avatar`, getProfileImages);
}

module.exports =  routes;