const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fastifyMultipart = require('@fastify/multipart');
const fileType = require('file-type');


async function getProfileImages(req, reply)
{
  try
  {
    const id = req.params.id;
    const img = await this.db.get("SELECT profileImage FROM users WHERE id = ?", id);
    reply.code(200).send(img.profileImage);
  }
  catch (err)
  {
    console.log(err);
    reply.code(500).send({success: false, message: "internal server error"});
  }
}

async function UploadToServer(req, reply)
{
  const datafile = await req.file();
  const fileBuffer = await datafile.toBuffer();
  const type = await fileType.fromBuffer(fileBuffer);
  if (!type)
      throw {code: 401, message: "this type not seported"};

  const allowedTypes = ["jpg", "png", "gif"];
  if (!allowedTypes.includes(type.ext))
    throw {code: 401, message: "this type not seported"};

  const file_name = uuidv4() + `.${type.ext}`;
  const file_path = path.join(__dirname, '../static', file_name);
  await fs.promises.writeFile(file_path, await datafile.toBuffer());
  return {file_name, file_path};
}

async function modifyAvatar(req, reply)
{
  try
  {
    const paths = await UploadToServer(req, reply);
    try 
    {
      const id = req.params.id;
      const data = await this.db.get("SELECT profileImage FROM users WHERE id = ?", id);
      const imgpath = path.basename(data.profileImage);
      if (imgpath != `Default_pfp.jpg`)
        await fs.promises.unlink(path.join(__dirname, '../static', imgpath));
      const imageUri = `/public/${paths.file_name}`;
      await this.db.run("UPDATE users SET profileImage = ?  WHERE id = ?", [imageUri, id]);
    }
    catch (err) {
      await fs.promises.unlink(paths.file_path);
      throw {error: "failed to delete prives avatar"};

    }
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
    const data = await this.db.get("SELECT profileImage FROM users WHERE id = ?", id);
    const imgpath = path.basename(data.profileImage);
    console.log(path.join(__dirname, '../static', imgpath));
    if (imgpath == `Default_pfp.jpg`)
      reply.code(401).send({success: false, message: "can't delete the default img"});
    else
    {
      await fs.promises.unlink(path.join(__dirname, '../static', imgpath));
      await this.db.run("UPDATE users SET profileImage = ? WHERE id = ?", ["/public/Default_pfp.jpg", id]);
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
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 2 * 1024 * 1024,
    }
  });
  fastify.delete('/users/:id/settings-avatar', deleteAvatar);
  fastify.put(`/users/:id/settings-avatar`, modifyAvatar);
  fastify.get(`/users/:id/settings-avatar`, getProfileImages);
}

module.exports =  routes;