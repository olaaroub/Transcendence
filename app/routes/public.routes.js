const path = require('path');
async function publicRoutes(fastify, opts)
{
    const staticOps = {
        root: path.join(__dirname, '../static'),
        prefix: '/public/'
      };

    fastify.register(require('@fastify/static') , staticOps);
    fastify.register(require('./local.authentication'));
    fastify.register(require('./google.authentication'), opts);
    fastify.register(require('./github.authentication'), opts);
    fastify.register(require('./42intra.authentication'), opts);
    fastify.register(require('./notificationLiveStream'));
    fastify.register(require('./user.statistic'));
}

module.exports = publicRoutes;