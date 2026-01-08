const sinon = require('sinon');

/**
 * Create a mock database with common methods
 * @returns {Object} Mock database instance with sinon stubs
 */
function createMockDb() {
    return {
        run: sinon.stub(),
        get: sinon.stub(),
        all: sinon.stub(),
        exec: sinon.stub()
    };
}

/**
 * Reset all stubs in the mock database
 * @param {Object} mockDb - Mock database instance
 */
function resetMockDb(mockDb) {
    mockDb.run.reset();
    mockDb.get.reset();
    mockDb.all.reset();
    mockDb.exec.reset();
}

/**
 * Create test user data
 * @param {Object} overrides - Override default values
 * @returns {Object} User object
 */
function createTestUser(overrides = {}) {
    return {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        ...overrides
    };
}

/**
 * Create test user info data
 * @param {Object} overrides - Override default values
 * @returns {Object} User info object
 */
function createTestUserInfo(overrides = {}) {
    return {
        id: 1,
        user_id: 1,
        profileImage: 'http://127.0.0.1:3000/public/default_pfp.png',
        bio: 'Test bio',
        TotalWins: 0,
        WinRate: 0,
        CurrentStreak: 0,
        Rating: 1000,
        ...overrides
    };
}

module.exports = {
    createMockDb,
    resetMockDb,
    createTestUser,
    createTestUserInfo
};
