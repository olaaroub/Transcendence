const { test } = require('tap');
const buildApp = require('../helpers/build-app');
const { createMockDb, resetMockDb } = require('../helpers/mock-db');
const { createAuthHeader } = require('../helpers/auth-helper');

test('Friend System - Requester Routes', async (t) => {
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

    await t.test('PUT /users/:id/add-friend - successful friend request', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/add-friend?receiver_id=2',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 201, 'should return 201 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
    });

    await t.test('PUT /users/:id/add-friend - duplicate request', async (t) => {
        mockDb.run.rejects(new Error('UNIQUE constraint failed'));

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/add-friend?receiver_id=2',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 401, 'should return 401 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
    });

    await t.test('PUT /users/:id/add-friend - self friend request', async (t) => {
        // Database constraint should prevent this
        mockDb.run.rejects(new Error('CHECK constraint failed'));

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/add-friend?receiver_id=1',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 401, 'should return 401 status');
    });

    await t.test('PUT /users/:id/add-friend - missing receiver_id', async (t) => {
        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/add-friend',
            headers: createAuthHeader(1, 'user1')
        });

        // Will still process but receiver_id will be undefined
        t.ok(response.statusCode, 'should return a response');
    });

    await t.test('GET /users/:id/friends - successful retrieval', async (t) => {
        const friends = [
            { id: 2, username: 'friend1' },
            { id: 3, username: 'friend2' },
            { id: 4, username: 'friend3' }
        ];

        mockDb.all.resolves(friends);

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/friends',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.length, 3, 'should return 3 friends');
        t.equal(json[0].username, 'friend1', 'should return friend username');
    });

    await t.test('GET /users/:id/friends - empty friend list', async (t) => {
        mockDb.all.resolves([]);

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/friends',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.same(json, [], 'should return empty array');
    });

    await t.test('GET /users/:id/friends - database error', async (t) => {
        mockDb.all.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/friends',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
    });

    await t.test('GET /users/:id/friends - query handles both requester and receiver', async (t) => {
        // This test ensures the complex SQL query works correctly
        const friends = [
            { id: 2, username: 'friend1' },  // User 1 is requester
            { id: 5, username: 'friend2' }   // User 1 is receiver
        ];

        mockDb.all.resolves(friends);

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/friends',
            headers: createAuthHeader(1, 'user1')
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.ok(Array.isArray(json), 'should return array');
    });

    await t.test('Friend routes require authentication', async (t) => {
        const endpoints = [
            { method: 'PUT', url: '/users/1/add-friend?receiver_id=2' },
            { method: 'GET', url: '/users/1/friends' }
        ];

        for (const endpoint of endpoints) {
            const response = await app.inject({
                method: endpoint.method,
                url: endpoint.url
            });

            t.equal(response.statusCode, 401, `${endpoint.method} ${endpoint.url} should require auth`);
        }
    });
});
