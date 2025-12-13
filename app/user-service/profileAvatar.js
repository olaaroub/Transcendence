import path from 'path';
import fs from 'fs';
import fastifyMultipart from '@fastify/multipart';
import fileType from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import createError from 'http-errors';

const __dirname = import.meta.dirname;

async function UploadToServer(req) {
  const datafile = await req.file();

  if (!datafile) {
    throw createError.BadRequest("No image file provided");
  }

  const fileBuffer = await datafile.toBuffer();
  const type = await fileType.fromBuffer(fileBuffer);

  const allowedTypes = ["jpg", "png", "gif"];
  if (!type || !allowedTypes.includes(type.ext)) {
    throw createError.BadRequest("Unsupported file type. Use jpg, png, or gif.");
  }

  const file_name = uuidv4() + `.${type.ext}`;
  const file_path = path.join(__dirname, 'static', file_name);

  await fs.promises.writeFile(file_path, fileBuffer);
  return { file_name, file_path };
}


async function getProfileImages(req, reply) {
  const id = req.params.id;
  const img = this.db.prepare("SELECT avatar_url FROM userInfo WHERE id = ?").get([id]);

  if (!img) {
    throw createError.NotFound("User not found");
  }

  return img;
}

async function modifyAvatar(req, reply) {
  const paths = await UploadToServer(req);

  try {
    const id = req.params.id;

    const data = this.db.prepare("SELECT avatar_url FROM userInfo WHERE id = ?").get(id);

    if (!data) throw createError.NotFound("User not found");

    const imgpath = path.basename(data.avatar_url);

    if (imgpath !== `Default_pfp.jpg`) {
      await fs.promises.unlink(path.join(__dirname, 'static', imgpath)).catch(() => { });
    }

    const imageUri = `/public/${paths.file_name}`;
    this.db.prepare("UPDATE userInfo SET avatar_url = ?  WHERE id = ?").run([imageUri, id]);

    req.log.info({ userId: id, newImage: imageUri }, "Avatar updated");
    reply.code(201).send({ success: true, message: "Profile image updated successfully" });

  } catch (err) {
    console.log(err)
    await fs.promises.unlink(paths.file_path).catch(() => { });
    throw err;
  }
}

async function deleteAvatar(req, reply) {
  const id = req.params.id;
  const data = this.db.prepare("SELECT avatar_url FROM userInfo WHERE id = ?").get(id);

  if (!data) throw createError.NotFound("User not found");

  const imgpath = path.basename(data.avatar_url);

  if (imgpath === `Default_pfp.jpg`) {
    throw createError.BadRequest("Cannot delete the default avatar");
  }

  await fs.promises.unlink(path.join(__dirname, 'static', imgpath)).catch(() => { });

  this.db.prepare("UPDATE userInfo SET avatar_url = ? WHERE id = ?").run(["/public/Default_pfp.jpg", id]);

  request.log.info({ userId: id }, "Avatar deleted (reset to default)");
  reply.code(200).send({ success: true, message: "Profile image deleted" });
}

async function routes(fastify) {
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB Limit
    }
  });

  fastify.delete('/user/:id/settings-avatar', deleteAvatar);
  fastify.put(`/user/:id/settings-avatar`, modifyAvatar);
  fastify.get(`/user/:id/settings-avatar`, getProfileImages);
}

export default routes;