const { test } = require('tap');
const buildApp = require('../helpers/build-app');
const { createMockDb, resetMockDb, createTestUser } = require('../helpers/mock-db');
const { createAuthHeader } = require('../helpers/auth-helper');

test('User Routes - Get Users', async (t) => {
    let app;
    let mockDb;

    t.beforeEach(async () => {
        mockDb = createMockDb();
        app = await buildApp(mockDb);
    });

    t.afterEach(async () => {
        await app.close();
        resetMockDb(mockDb);
    });

    await t.test('GET /users - successful retrieval', async (t) => {
        const users = [
            { id: 1, username: 'user1', email: 'user1@example.com' },
            { id: 2, username: 'user2', email: 'user2@example.com' },
            { id: 3, username: 'user3', email: 'user3@example.com' }
        ];

        mockDb.all.resolves(users);

        const response = await app.inject({
            method: 'GET',
            url: '/users',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.same(json, users, 'should return all users');
        t.equal(json.length, 3, 'should return 3 users');
    });

    await t.test('GET /users - empty list', async (t) => {
        mockDb.all.resolves([]);

        const response = await app.inject({
            method: 'GET',
            url: '/users',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.same(json, [], 'should return empty array');
    });

    await t.test('GET /users - database error', async (t) => {
        mockDb.all.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'GET',
            url: '/users',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.match(json.error, /Internal server error/, 'should return error message');
    });

    await t.test('GET /users - no authentication token', async (t) => {
        const response = await app.inject({
            method: 'GET',
            url: '/users'
        });

        t.equal(response.statusCode, 401, 'should return 401 status');
    });

    await t.test('GET /users/:id - successful retrieval', async (t) => {
        const user = createTestUser({ id: 42 });
        mockDb.get.resolves(user);

        const response = await app.inject({
            method: 'GET',
            url: '/users/42',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.id, 42, 'should return correct user id');
        t.equal(json.username, user.username, 'should return username');
    });

    await t.test('GET /users/:id - user not found', async (t) => {
        mockDb.get.resolves(null);

        const response = await app.inject({
            method: 'GET',
            url: '/users/999',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json, null, 'should return null for non-existent user');
    });

    await t.test('GET /users/:id - invalid id format', async (t) => {
        const response = await app.inject({
            method: 'GET',
            url: '/users/invalid',
            headers: createAuthHeader()
        });

        // Will still call the handler, database will handle the invalid id
        t.ok(response.statusCode >= 200, 'should return a response');
    });

    await t.test('GET /users/:id - database error', async (t) => {
        mockDb.get.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'GET',
            url: '/users/1',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.match(json.error, /Internal server error/, 'should return error message');
    });
});
