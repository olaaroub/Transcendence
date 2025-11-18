
async function Routes  (fastify)
{
    fastify.register(require('./settings'));
    fastify.register(require('./authentication'));
    fastify.register(require('./images'));
    fastify.register(require('./search'));
    fastify.register(require('./friendsReceiver'));
    fastify.register(require('./friendsRequester'));
    fastify.register(require('./simpleWebSocket'));
    fastify.register(require('./deleteAccount'));
    fastify.register(require('./authentication.google'));
}

module.exports = Routes;