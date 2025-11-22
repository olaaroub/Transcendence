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
}

module.exports = publicRoutes;