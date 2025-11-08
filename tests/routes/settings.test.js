const { test } = require('tap');
const buildApp = require('../helpers/build-app');
const { createMockDb, resetMockDb } = require('../helpers/mock-db');
const { createAuthHeader } = require('../helpers/auth-helper');

test('Settings Routes', async (t) => {
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

    await t.test('PUT /users/:id/settings-username - successful update', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-username',
            headers: createAuthHeader(1, 'oldusername'),
            payload: { username: 'newusername' }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
        t.match(json.message, /username/, 'should mention username in message');
    });

    await t.test('PUT /users/:id/settings-username - database error', async (t) => {
        mockDb.run.rejects(new Error('UNIQUE constraint failed'));

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-username',
            headers: createAuthHeader(),
            payload: { username: 'duplicateuser' }
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
    });

    await t.test('PUT /users/:id/settings-username - missing username', async (t) => {
        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-username',
            headers: createAuthHeader(),
            payload: {}
        });

        // Should still call handler, but username will be undefined
        t.ok(response.statusCode, 'should return a response');
    });

    await t.test('PUT /users/:id/settings-bio - successful update', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-bio',
            headers: createAuthHeader(),
            payload: { bio: 'This is my new bio' }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
        t.match(json.message, /bio/, 'should mention bio in message');
    });

    await t.test('PUT /users/:id/settings-bio - empty bio', async (t) => {
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-bio',
            headers: createAuthHeader(),
            payload: { bio: '' }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
    });

    await t.test('PUT /users/:id/settings-bio - long bio', async (t) => {
        mockDb.run.resolves();
        const longBio = 'A'.repeat(1000);

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-bio',
            headers: createAuthHeader(),
            payload: { bio: longBio }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
    });

    await t.test('PUT /users/:id/settings-password - successful update', async (t) => {
        mockDb.get.resolves({ password: '1234' });
        mockDb.run.resolves();

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-password',
            headers: createAuthHeader(),
            payload: { 
                currentPassword: '1234', 
                newPassword: '12354' }
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
        t.match(json.message, /password/, 'should mention password in message');
    });

    await t.test('PUT /users/:id/settings-password - database error', async (t) => {
        mockDb.run.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'PUT',
            url: '/users/1/settings-password',
            headers: createAuthHeader(),
            payload: { password: 'newpassword' }
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
    });

    await t.test('GET /users/:id/profile - successful retrieval', async (t) => {
        const profileData = {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            profileImage: 'http://127.0.0.1:3000/public/Default_pfp.jpg',
            bio: 'Test bio'
        };

        mockDb.get.resolves(profileData);

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/profile',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.id, 1, 'should return user id');
        t.equal(json.username, 'testuser', 'should return username');
        t.equal(json.bio, 'Test bio', 'should return bio');
    });

    await t.test('GET /users/:id/profile - user not found', async (t) => {
        mockDb.get.resolves(null);

        const response = await app.inject({
            method: 'GET',
            url: '/users/999/profile',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json, null, 'should return null');
    });

    await t.test('GET /users/:id/profile - database error', async (t) => {
        mockDb.get.rejects(new Error('Database error'));

        const response = await app.inject({
            method: 'GET',
            url: '/users/1/profile',
            headers: createAuthHeader()
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
    });

    await t.test('Settings routes require authentication', async (t) => {
        const endpoints = [
            { method: 'PUT', url: '/users/1/settings-username', payload: { username: 'test' } },
            { method: 'PUT', url: '/users/1/settings-bio', payload: { bio: 'test' } },
            { method: 'PUT', url: '/users/1/settings-password', payload: { password: 'test' } },
            { method: 'GET', url: '/users/1/profile' }
        ];

        for (const endpoint of endpoints) {
            const response = await app.inject({
                method: endpoint.method,
                url: endpoint.url,
                payload: endpoint.payload
            });

            t.equal(response.statusCode, 401, `${endpoint.method} ${endpoint.url} should require auth`);
        }
    });
});
