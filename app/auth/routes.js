
import local_auth from './local.authentication.js'
import googlea_auth from './google.authentication.js'
import github_auth from './github.authentication.js'
import intra_auth from './42intra.authentication.js'
import { changePassword } from './changePassword.js'
import towFactorAuthentication from './2fa.js'

// import notificationLiveStream from '../user-service/notificationLiveStream.js'
// import statistic from '../user-service/user.statistic.js'
// import leaderBord from '../user-service/leaderBord.js'
import { fileURLToPath } from 'url';

async function deleteAccountHandler(req, reply)
{
  const id = req.params.id;

  this.db.prepare("DELETE FROM users WHERE id = ?").run([id]);
  return ({ok: true, message: "the colume deleted successfly"})

}

async function changeUserNameHandler(req, reply)
{
  const id = req.params.id;
  const { username } = req.body;
  console.log(id, username);
  this.db.prepare("UPDATE users SET username = ? WHERE id = ?").run([username, id]);
  return {ok: true};
}

async function getAuthProviderHandler(req, reply)
{
  const id = req.params.id;

  const authprovider = this.db.prepare("SELECT auth_provider FROM users WHERE id = ?").get([id]);
  return authprovider;
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
  fastify.register(towFactorAuthentication);
  fastify.delete("/auth/deletAccount/:id", deleteAccountHandler)
  fastify.put("/auth/changeUsername/:id", changeUserNameHandler)
  fastify.get("/auth/provider/:id", getAuthProviderHandler);
}

// module.exports = publicRoutes;
export default publicRoutes;0