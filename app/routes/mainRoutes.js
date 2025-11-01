const users = require('./users');
const images = require("./images");
const search_bar = require("./search");

async function Routes  (fastify)
{
    await users.sign_up(fastify);
    await users.login(fastify);
    await users.getUsers(fastify);
    await images.getProfileImages(fastify);
    await images.modifyAvatar(fastify);
    await images.deleteAvatar(fastify);
    await search_bar(fastify);
    fastify.register(require('./settings'));
}

module.exports = Routes;