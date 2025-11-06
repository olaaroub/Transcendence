const { test } = require('tap');
const buildApp = require('../helpers/build-app');
const { createMockDb, resetMockDb, createTestUser } = require('../helpers/mock-db');

test('User Authentication Routes', async (t) => {
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

    await t.test('POST /signUp - successful signup', async (t) => {
        const testUser = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123'
        };

        mockDb.run.onFirstCall().resolves();
        mockDb.get.resolves({ id: 1 });
        mockDb.run.onSecondCall().resolves();

        const response = await app.inject({
            method: 'POST',
            url: '/signUp',
            payload: testUser
        });

        t.equal(response.statusCode, 201, 'should return 201 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
        t.equal(json.message, 'created', 'should return created message');
    });

    await t.test('POST /signUp - duplicate user', async (t) => {
        const testUser = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'password123'
        };

        mockDb.run.rejects(new Error('UNIQUE constraint failed'));

        const response = await app.inject({
            method: 'POST',
            url: '/signUp',
            payload: testUser
        });

        t.equal(response.statusCode, 500, 'should return 500 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
        t.match(json.message, /alredy exist|already exist/i, 'should indicate user exists');
    });

    await t.test('POST /signUp - invalid email format', async (t) => {
        const testUser = {
            username: 'newuser',
            email: 'invalid-email',
            password: 'password123'
        };

        const response = await app.inject({
            method: 'POST',
            url: '/signUp',
            payload: testUser
        });

        t.equal(response.statusCode, 400, 'should return 400 status');
        const json = JSON.parse(response.body);
        t.equal(json.code, 'FST_ERR_VALIDATION', 'should return validation error');
    });

    await t.test('POST /signUp - missing required fields', async (t) => {
        const testUser = {
            username: 'newuser'
            // missing email and password
        };

        const response = await app.inject({
            method: 'POST',
            url: '/signUp',
            payload: testUser
        });

        t.equal(response.statusCode, 400, 'should return 400 status');
    });

    await t.test('POST /login - successful login with username', async (t) => {
        const credentials = {
            username: 'testuser',
            password: 'password123'
        };

        const dbUser = createTestUser();
        mockDb.get.resolves(dbUser);

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
        t.equal(json.id, dbUser.id, 'should return user id');
        t.ok(json.token, 'should return JWT token');
    });

    await t.test('POST /login - successful login with email', async (t) => {
        const credentials = {
            username: 'test@example.com',
            password: 'password123'
        };

        const dbUser = createTestUser();
        mockDb.get.resolves(dbUser);

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        t.equal(response.statusCode, 200, 'should return 200 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, true, 'should return success true');
    });

    await t.test('POST /login - wrong password', async (t) => {
        const credentials = {
            username: 'testuser',
            password: 'wrongpassword'
        };

        const dbUser = createTestUser({ password: 'correctpassword' });
        mockDb.get.resolves(dbUser);

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        t.equal(response.statusCode, 401, 'should return 401 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
        t.match(json.message, /password not correct/, 'should indicate wrong password');
    });

    await t.test('POST /login - user not found', async (t) => {
        const credentials = {
            username: 'nonexistent',
            password: 'password123'
        };

        mockDb.get.resolves(null);

        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: credentials
        });

        t.equal(response.statusCode, 401, 'should return 401 status');
        const json = JSON.parse(response.body);
        t.equal(json.success, false, 'should return success false');
        t.match(json.message, /go to signUp/, 'should suggest signup');
    });

    await t.test('POST /login - missing credentials', async (t) => {
        const response = await app.inject({
            method: 'POST',
            url: '/login',
            payload: { username: 'testuser' }
        });

        t.equal(response.statusCode, 400, 'should return 400 status');
    });
});
