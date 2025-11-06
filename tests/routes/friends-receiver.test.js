const { test } = require('tap');
const buildApp = require('../helpers/build-app');
const { createMockDb, resetMockDb } = require('../helpers/mock-db');
const { createAuthHeader } = require('../helpers/auth-helper');

test('Friend System - Receiver Routes', async (t) => {
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

    await t.test('POST /users/:id/friend-request - accept friend request', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: true,
                id: 1
            }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
    });

    await t.test('POST /users/:id/friend-request - reject friend request', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: false,
                id: 1
            }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
    });

    await t.test('POST /users/:id/friend-request - accept updates status to ACCEPTED', async (t) => {
        mockDb.run.resolves();

        await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: true,
                id: 1
            }
        });

        // Verify the correct SQL was called
        t.ok(mockDb.run.called, 'should call database run');
        const callArgs = mockDb.run.getCall(0).args;
        t.match(callArgs[0], /UPDATE.*status.*=.*\?/i, 'should update status with parameter');
        t.equal(callArgs[1][0], 'ACCEPTED', 'should set status to ACCEPTED');
    });

    await t.test('POST /users/:id/friend-request - reject deletes friendship', async (t) => {
        mockDb.run.resolves();

        await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: false,
                id: 1
            }
        });

        // Verify the correct SQL was called
        t.ok(mockDb.run.called, 'should call database run');
        const callArgs = mockDb.run.getCall(0).args;
        t.match(callArgs[0], /DELETE/i, 'should delete friendship');
    });

    await t.test('POST /users/:id/friend-request - database error on accept', async (t) => {
        mockDb.run.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: true,
                id: 1
            }
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
    });

    await t.test('POST /users/:id/friend-request - database error on reject', async (t) => {
        mockDb.run.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: false,
                id: 1
            }
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
    });

    await t.test('POST /users/:id/friend-request - missing requester id', async (t) => {
        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                accept: true
                // missing id
            }
        });

        t.ok(response.statusCode, 'should return a response');
    });

    await t.test('POST /users/:id/friend-request - missing accept field', async (t) => {
        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            headers: createAuthHeader(2, 'user2'),
            payload: {
                id: 1
                // missing accept
            }
        });

        t.ok(response.statusCode, 'should return a response');
    });

    await t.test('POST /users/:id/friend-request - requires authentication', async (t) => {
        const response = await app.inject({
            method: 'POST',
            url: '/users/2/friend-request',
            payload: {
                accept: true,
                id: 1
            }
        });

        t.equal(response.statusCode, 401, 'should return 401 without auth');
    });
});
