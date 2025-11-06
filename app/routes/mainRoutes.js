
async function Routes  (fastify)
{
    fastify.register(require('./settings'));
    fastify.register(require('./users'));
    fastify.register(require('./images'));
    fastify.register(require('./search'));
    fastify.register(require('./friendsReceiver'));
    fastify.register(require('./friendsRequester'));
}

module.exports = Routes;