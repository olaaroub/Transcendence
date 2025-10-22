const fastify = require("fastify");

const sign_up = async (fastify) => {
	try
	{
		fastify.post("/signUp", {
				schema: {
					body: {
						type: "object",
						required: ["username", "password", "email"],
						properties: {
							username: { type: "string" },
							email: {type: "string", format: 'email'},
							password: { type: "string"}
						}
					}
				},
				errorHandler: (error, request, reply) =>
				{
						if (error.validation)
						{
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
			},
			async (request, reply) => {
				let data = request.body;
				try {
					await fastify.db.run("INSERT INTO users(user, password, email) VALUES (?, ?, ?)", [data.username, data.password, data.email]);
					reply.code(201)
						.send({message: "created", success: true});
				} catch (err) {
					console.error('Error inserting user:', err.message);
					reply.code(500)
						.send({message: "this user is alredy exist !", success: false});
				}
		});
	}
	catch (err)
	{
		console.log(err.message);
	}
}

const getUsers = async (fastify) => {
		fastify.get("/users", async (req, reply) => {
			try {
				const data =  await fastify.db.all("SELECT id, user, email FROM users");
				reply.code(200).send(data);
			} catch {
				reply.code(500).send({ error: "Internal server error" });
			}
		});
		fastify.get('/search/users/:id', async (req, reply) => {
			try {
				const responseData = await fastify.db.get('SELECT id, user, email FROM users WHERE id = ?', [req.params.id]);
				reply.code(200).send(responseData);
			}
			catch {
				reply.code(500).send({ error: "Internal server error" });
			}
		})
}


const login = async (fastify) => {
		fastify.post("/login", {
			schema: {
				body: {
					type: "object",
					required: ["username", "password"],
						properties: {
							username: { type: "string" },
							password: { type: "string"}
						}
				}
			}
		},
		async(req, reply) => {
				const body = req.body;
				try {
					const user = await fastify.db.get('SELECT user FROM users WHERE user = ?', [body.username]);
					if (user)
						reply.code(200).send({message: "login successfully", success: true});
					else
						reply.code(401).send({message: "go to signUp", success: false});
				}
				catch {
					reply.code(500).send({ error: "Internal server error", success: false });
				}
		});
}

const Routes = async (fastify) => {
		await sign_up(fastify);
		await login(fastify);
		await getUsers(fastify);
}

module.exports = Routes;