import createError from 'http-errors';
import argon2 from 'argon2';

const ext = process.env.SERVICE_EXT || '-prod';
const USER_SERVICE_URL = `http://user-service${ext}:3002`;

async function signUpHandler(request, reply) {

	let data = request.body;

	if (!data.username || !data.password) {
		throw createError.BadRequest("Empty fields detected");
	}

	let newUserData;
	try {
		const hashedPassword = await argon2.hash(data.password);
		// console.log(hashedPassword);
		newUserData = this.db.prepare("INSERT INTO users(username, password, email) VALUES (?, ?, ?) RETURNING id, username")
			.get([data.username, hashedPassword, data.email]);
	}
	catch (err) {
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			throw createError.Conflict("User with this email or username already exists");
		}
		throw err;
	}
	const createNewUserRes = await fetch(`${USER_SERVICE_URL}/api/user/createNewUser`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
			// I will add the secret key to check the request is from the microserves
		},
		body: JSON.stringify({
			user_id: newUserData.id,
			username: newUserData.username
		})
	});

	if (!createNewUserRes.ok) {
		this.db.prepare('DELETE FROM users WHERE id = ?').run([newUserData.id]);
		throw createError.BadGateway("Failed to synchronize user with User Service");
	}

	request.log.info({
		userId: newUserData.id,
		username: newUserData.username
	}, "User registered successfully");

	reply.code(201).send({
		message: "User created successfully",
		id: newUserData.id,
		username: newUserData.username,
		success: true
	});
}

async function loginHandler(req, reply) {

	const body = req.body;

	const user = this.db.prepare('SELECT username, password, auth_provider ,id FROM users WHERE username = ? OR email = ?')
		.get([body.username, body.username]);

	if (!user) {
		this.customMetrics.loginCounter.inc({ status: 'failure', provider: 'local' });
		throw createError.Unauthorized("Invalid Alias/Password! Try Again.");
	}

	if (user.auth_provider !== "local") {
		this.customMetrics.loginCounter.inc({ status: 'failure', provider: 'local' });
		throw createError.Conflict(`Please login with your provider: ${user.auth_provider}`);
	}
	const validPassword = await argon2.verify(user.password, body.password);
	if (!validPassword) {
		this.customMetrics.loginCounter.inc({ status: 'failure', provider: 'local' });
		throw createError.Unauthorized("Invalid Alias/Password! Try Again.");
	}

	req.log.info({ userId: user.id, username: user.username }, "User logged in succcessfully");

	this.customMetrics.loginCounter.inc({ status: 'success', provider: 'local' });

	const token = this.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '30m' });

	return {
		success: true,
		message: "login successfully",
		id: user.id,
		token: token
	};
}

async function getUsers(req, reply) {

	const data = this.db.prepare("SELECT id, username, auth_provider, email FROM users").all();
	return data;
}

async function getUserById(req, reply) {

	const responseData = await this.db.prepare('SELECT id, username, email FROM users WHERE id = ?').get([req.params.id]);

	if (!responseData) {
		throw createError.NotFound("User not found");
	}

	return responseData;
}

async function routes(fastify) {

	fastify.post("/auth/login", {
		schema: {
			body: {
				type: "object",
				required: ["username", "password"],
				properties: {
					username: { type: "string" },
					password: { type: "string" }
				}
			}
		}
	}, loginHandler);

	fastify.post("/auth/signUp", {
		schema: {
			body: {
				type: "object",
				required: ["username", "password", "email"],
				properties: {
					username: { type: "string" },
					email: { type: "string", format: 'email' },
					password: { type: "string" }
				}
			}
		}
		// errorHandler: 7yedto (Global Handler hia likhasha tkhdm )
	}, signUpHandler);
	fastify.get("/auth/users", getUsers);
	fastify.get('/auth/users/:id', getUserById);

}

export default routes;
