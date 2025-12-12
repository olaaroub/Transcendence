
function signUperrorHandler(error, request, reply) {
	if (error.validation) {
		reply.status(400).send({
			"statusCode": 400,
			"code": "FST_ERR_VALIDATION",
			"error": "Bad Request",
			"message": "body/email must match format \"email\""
		});
		console.log("body/email must match format \"email\"");
	}
	else
		reply.send(error);
}

async function signUpHandler(request, reply) {
	let data = request.body;
	try {
		if (!data.username || !data.password) {
			reply.code(401).send({ error: "the  username or password is emty" });
			return;
		}
		const newUserData = this.db.prepare("INSERT INTO users(username, password, email) VALUES (?, ?, ?) RETURNING id, username")
								   .get([data.username, data.password, data.email]);
		console.log(newUserData);
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
		if (!createNewUserRes.ok)
		{
			this.db.prepare('DELETE FROM users WHERE id = ?').run([newUserData.id]);
			throw {message: "can not singUp"};
		}
		reply.code(201)
			.send({ message: "created", success: true });
	}
	catch (err) {
		console.error('Error inserting user:', err.message);
		reply.code(500)
			.send({ message: "this user is alredy exist !", success: false });
	}
}

async function loginHandler(req, reply) {

	const body = req.body;
	try {
		const user = this.db.prepare('SELECT username, password, auth_provider ,id FROM users WHERE username = ? OR email = ?').get([body.username, body.username]);
		console.log("first user ", user);
		if (user && user.auth_provider == "local") {
			if (user.password != body.password)
				reply.code(401).send({ message: "password not correct", success: false });
			else {
				const token = this.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '1h' })
				// console.log(token);
				console.log("second user print ", user);
				reply.code(200).send({ message: "login successfully", success: true, id: user.id, token: token });
			}
		}
		else if (user && user.auth_provider != "local")
			reply.code(401).send({ message: `your can't login manual , must login with your auth_provider (${user.auth_provider}) `, success: false });
		else
			reply.code(401).send({ message: "go to signUp", success: false });
	}
	catch (err) {
		reply.code(500).send({ error: "Internal server error", success: false });
		console.log(err)
	}
}

async function getUsers(req, reply) {
	try {
		const data = this.db.prepare("SELECT id, username, auth_provider, email FROM users").all();
		reply.code(200).send(data);
	} catch {
		reply.code(500).send({ error: "Internal server error" });
	}
}

async function getUserById(req, reply) {
	try {
		const responseData = await this.db.prepare('SELECT id, username, email FROM users WHERE id = ?').get([req.params.id]);
		reply.code(200).send(responseData);
	}
	catch {
		reply.code(500).send({ error: "Internal server error" });
	}
}

async function routes(fastify) {
	try {
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
			},
			errorHandler: signUperrorHandler
		}, signUpHandler);
		fastify.get("/auth/users", getUsers);
		fastify.get('/auth/users/:id', getUserById);



	}
	catch (err) {
		console.log(err);
		reply.code(500).send({ message: "you can't login" });
	}


}

// module.exports = routes;
export default routes;
