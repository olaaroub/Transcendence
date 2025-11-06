const jwt = require('jsonwebtoken');

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @returns {string} JWT token
 */
function generateTestToken(payload = { userId: 1, username: 'testuser' }, secret = 'supersecret') {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * Create authorization header with test token
 * @param {number} userId - User ID
 * @param {string} username - Username
 * @returns {Object} Headers object with authorization
 */
function createAuthHeader(userId = 1, username = 'testuser') {
    const token = generateTestToken({ userId, username });
    return {
        authorization: `Bearer ${token}`
    };
}

module.exports = {
    generateTestToken,
    createAuthHeader
};
