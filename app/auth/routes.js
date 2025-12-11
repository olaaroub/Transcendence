
import local_auth from './local.authentication.js'
import googlea_auth from './google.authentication.js'
import github_auth from './github.authentication.js'
import intra_auth from './42intra.authentication.js'
import { changePassword } from './changePassword.js'
// import notificationLiveStream from '../user-service/notificationLiveStream.js'
// import statistic from '../user-service/user.statistic.js'
// import leaderBord from '../user-service/leaderBord.js'
import { fileURLToPath } from 'url';

async function deleteAccountHandler(req, reply)
{
  const id = req.params.id;
  try
  {
      this.db.prepare("DELETE FROM users WHERE id = ?").run([id]);
      reply.code(204).send({ok: true, message: "the colume deleted successfly"})
  }
  catch (err)
  {
    console.log(err)
    reply.code(500).send({ok:false, message: "internal server error"})
  }
}

async function publicRoutes(fastify, opts) {

  const secretOpts = {
    secrets: opts.secrets
  };
  // fastify.register(fastifyStatic , staticOps);
  fastify.register(local_auth);
  fastify.register(googlea_auth, secretOpts);
  fastify.register(github_auth, secretOpts);
  fastify.register(intra_auth, secretOpts);
  fastify.register(changePassword);
  fastify.delete("/auth/deletAccount/:id", deleteAccountHandler)
}

// module.exports = publicRoutes;
export default publicRoutes;