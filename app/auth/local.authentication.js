import createError from 'http-errors';
import argon2 from 'argon2';

// function signUperrorHandler(error, request, reply) {
// 	if (error.validation) {
// 		reply.status(400).send({
// 			"statusCode": 400,
// 			"code": "FST_ERR_VALIDATION",
// 			"error": "Bad Request",
// 			"message": "body/email must match format \"email\""
// 		});
// 		console.log("body/email must match format \"email\"");
// 	}
// 	else
// 		reply.send(error);
// }

async function signUpHandler(request, reply) {

	let data = request.body;

	if (!data.username || !data.password) {
		throw createError.BadRequest("Username or password is empty");
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
	const createNewUserRes = await fetch('http://user-service-dev:3002/api/user/createNewUser', {
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

	request.log.info({ userId: newUserData.id }, "User registered successfully");

	reply.code(201).send({ message: "created", success: true });


	// =============================================dialk==============================================
	// let data = request.body;
	// try {
	// 	if (!data.username || !data.password) {
	// 		reply.code(401).send({ error: "the  username or password is emty" });
	// 		return;
	// 	}
	// 	const newUserData = this.db.prepare("INSERT INTO users(username, password, email) VALUES (?, ?, ?) RETURNING id, username")
	// 							   .get([data.username, data.password, data.email]);
	// 	console.log(newUserData);
	// 	const createNewUserRes = await fetch('http://user-service-dev:3002/api/user/createNewUser', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 			// I will add the secret key to check the request is from the microserves
	// 		},
	// 		body: JSON.stringify({
	// 			user_id: newUserData.id,
	// 			username: newUserData.username
	// 			})
	// 	});
	// 	if (!createNewUserRes.ok)
	// 	{
	// 		this.db.prepare('DELETE FROM users WHERE id = ?').run([newUserData.id]);
	// 		throw {message: "can not singUp"};
	// 	}
	// 	reply.code(201)
	// 		.send({ message: "created", success: true });
	// }
	// catch (err) {
	// 	console.error('Error inserting user:', err.message);
	// 	reply.code(500)
	// 		.send({ message: "this user is alredy exist !", success: false });
	// }
}

async function loginHandler(req, reply) {

	const body = req.body;

	const user = this.db.prepare('SELECT username, password, auth_provider ,id FROM users WHERE username = ? OR email = ?')
		.get([body.username, body.username]);

	if (!user) {
		throw createError.Unauthorized("Invalid credentials");
	}

	if (user.auth_provider !== "local") {
		throw createError.Conflict(`Please login with your provider: ${user.auth_provider}`);
	}
	const validPassword = await argon2.verify(user.password, body.password);
	if (!validPassword) {
		throw createError.Unauthorized("Invalid credentials");
	}

	req.log.info({ userId: user.id, username: user.username }, "User logged in succcessfully");

	const token = this.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '1h' });

	return {
		success: true,
		message: "login successfully",
		id: user.id,
		token: token
	};

	// ============ HADCHI LTE7T HOWA DIALK ========
	// const body = req.body;
	// try {
	// 	const user = this.db.prepare('SELECT username, password, auth_provider ,id FROM users WHERE username = ? OR email = ?').get([body.username, body.username]);
	// 	console.log("first user ", user);
	// 	if (user && user.auth_provider == "local") {
	// 		if (user.password != body.password)
	// 			reply.code(401).send({ message: "password not correct", success: false });
	// 		else {
	// 			const token = this.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '1h' })
	// 			// console.log(token);
	// 			console.log("second user print ", user);
	// 			reply.code(200).send({ message: "login successfully", success: true, id: user.id, token: token });
	// 		}
	// 	}
	// 	else if (user && user.auth_provider != "local")
	// 		reply.code(401).send({ message: `your can't login manual , must login with your auth_provider (${user.auth_provider}) `, success: false });
	// 	else
	// 		reply.code(401).send({ message: "go to signUp", success: false });
	// }
	// catch (err) {
	// 	reply.code(500).send({ error: "Internal server error", success: false });
	// 	console.log(err)
	// }
}

async function getUsers(req, reply) {

	const data = this.db.prepare("SELECT id, username, auth_provider, email FROM users").all();
	return data;
	// ====================dialk=======================
	// try {
	// 	const data = this.db.prepare("SELECT id, username, auth_provider, email FROM users").all();
	// 	reply.code(200).send(data);
	// } catch {
	// 	reply.code(500).send({ error: "Internal server error" });
	// }
}

async function getUserById(req, reply) {

	const responseData = await this.db.prepare('SELECT id, username, email FROM users WHERE id = ?').get([req.params.id]);

	if (!responseData) {
		throw createError.NotFound("User not found");
	}

	return responseData;
	// =====================dialk===============
	// try {
	// 	const responseData = await this.db.prepare('SELECT id, username, email FROM users WHERE id = ?').get([req.params.id]);
	// 	reply.code(200).send(responseData);
	// }
	// catch {
	// 	reply.code(500).send({ error: "Internal server error" });
	// }
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


	// ====================dialk================
	// try {
	// 	fastify.post("/auth/login", {
	// 		schema: {
	// 			body: {
	// 				type: "object",
	// 				required: ["username", "password"],
	// 				properties: {
	// 					username: { type: "string" },
	// 					password: { type: "string" }
	// 				}
	// 			}
	// 		}
	// 	}, loginHandler);
	// 	fastify.post("/auth/signUp", {
	// 		schema: {
	// 			body: {
	// 				type: "object",
	// 				required: ["username", "password", "email"],
	// 				properties: {
	// 					username: { type: "string" },
	// 					email: { type: "string", format: 'email' },
	// 					password: { type: "string" }
	// 				}
	// 			}
	// 		},
	// 		// errorHandler: signUperrorHandler => global error handler handles all
	// 	}, signUpHandler);
	// 	fastify.get("/auth/users", getUsers);
	// 	fastify.get('/auth/users/:id', getUserById);



	// }
	// catch (err) {
	// 	console.log(err);
	// 	reply.code(500).send({ message: "you can't login" }); // reply makinach fhad function al7mar...
	// }


}

// module.exports = routes;
export default routes;
