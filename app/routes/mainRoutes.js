const users = require('./users');
const images = require("./images");

const Routes = async (fastify) => {
    await users.sign_up(fastify);
    await users.login(fastify);
    await users.getUsers(fastify);
    await images.getProfileImages(fastify);
  
}

module.exports = Routes;