import local_auth from './local.authentication.js'
import googlea_auth from './google.authentication.js'
import github_auth from './github.authentication.js'
import intra_auth from './42intra.authentication.js'
import { changePassword } from './changePassword.js'
import towFactorAuthentication from './2fa.js'

async function publicRoutes(fastify, opts) {

  const secretOpts = {
    secrets: opts.secrets
  };

  fastify.register(local_auth);
  fastify.register(googlea_auth, secretOpts);
  fastify.register(github_auth, secretOpts);
  fastify.register(intra_auth, secretOpts);
  fastify.register(changePassword);
  fastify.register(towFactorAuthentication);

}

export default publicRoutes;
