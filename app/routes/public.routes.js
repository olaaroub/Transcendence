const path = require('path');
async function publicRoutes(fastify)
{
    const staticOps = {
        root: path.join(__dirname, '../static'),
        prefix: '/public/'
      };

    fastify.register(require('@fastify/static') , staticOps);
    fastify.register(require('./local.authentication'));
    fastify.register(require('./google.authentication'));
    fastify.register(require('./github.authentication'));
    fastify.register(require('./42intra.authentication'));
    fastify.register(require('./notificationLiveStream'));
    fastify.register(require('./user.statistic'));
}

module.exports = publicRoutes;