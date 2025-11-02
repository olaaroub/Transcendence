
async function Routes  (fastify)
{
    fastify.register(require('./settings'));
    fastify.register(require('./users'));
    fastify.register(require('./images'));
    fastify.register(require('./search'))
}

module.exports = Routes;