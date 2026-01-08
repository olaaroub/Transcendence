import path from 'path';
import fs from 'fs';
import fastifyMultipart from '@fastify/multipart';
import fileType from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import createError from 'http-errors';
import { changeItemInOtherService } from './utils.js';


const __dirname = import.meta.dirname;
const ext = process.env.SERVICE_EXT || '-prod';
const GLOBAL_CHAT_SERVICE_URL = `http://global-chat${ext}:3003`;


async function UploadToServer(req) {
  const datafile = await req.file();

  if (!datafile) {
    throw createError.BadRequest("No image file provided");
  }

  const fileBuffer = await datafile.toBuffer();
  const type = await fileType.fromBuffer(fileBuffer);

  const allowedTypes = ["jpg", "png", "gif"];
  if (!type || !allowedTypes.includes(type.ext)) {
    throw createError.BadRequest("Unsupported file type use jpg, png, or gif.");
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

    const oldImgPath = path.basename(data.avatar_url);

    if (oldImgPath !== `default_pfp.png`) {
      await fs.promises.unlink(path.join(__dirname, 'static', oldImgPath)).catch(() => {
        req.log.warn({ err, file: oldImgPath }, "Failed to delete old avatar");
      });
    }

    const imageUri = `/public/${paths.file_name}`;

    await changeItemInOtherService(`${GLOBAL_CHAT_SERVICE_URL}/api/chat/global/avatar_url/${id}`, { newAvatarUrl: imageUri });

    this.db.prepare("UPDATE userInfo SET avatar_url = ?  WHERE id = ?").run([imageUri, id]);

    req.log.info({ userId: id, newImage: imageUri }, "Avatar updated");
    reply.code(201).send({ success: true, message: "Profile image updated successfully" });

  } catch (err) {
    req.log.error({ err, userId: req.params.id }, "Avatar update failed, cleaning up new file");
    await fs.promises.unlink(paths.file_path).catch((unlinkErr) => {
      req.log.warn({ err: unlinkErr, file: paths.file_path }, "Failed to clean up orphaned file");
    });
    throw err;
  }
}

async function deleteAvatar(req, reply) {
  const id = req.params.id;
  const data = this.db.prepare("SELECT avatar_url FROM userInfo WHERE id = ?").get(id);

  if (!data) throw createError.NotFound("User not found");

  const imgpath = path.basename(data.avatar_url);

  if (imgpath === `default_pfp.png`) {
    throw createError.BadRequest("Cannot delete the default avatar");
  }

  await fs.promises.unlink(path.join(__dirname, 'static', imgpath)).catch(() => {
    req.log.warn({ err, file: imgpath }, "Failed to delete avatar file from disk");
  });

  this.db.prepare("UPDATE userInfo SET avatar_url = ? WHERE id = ?").run(["/public/default_pfp.png", id]);

  await changeItemInOtherService(`${GLOBAL_CHAT_SERVICE_URL}/api/chat/global/avatar_url/${id}`, { newAvatarUrl: "/public/default_pfp.png" });

  req.log.info({ userId: id }, "Avatar reset to default");
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
