
async function Routes  (fastify)
{
    fastify.register(require('./settings'));
    fastify.register(require('./users'));
    fastify.register(require('./images'));
    fastify.register(require('./search'));
    fastify.register(require('./friendsReceiver'));
    fastify.register(require('./friendsRequester'));
    fastify.register(require('./simpleWebSocket'));
}

module.exports = Routes;