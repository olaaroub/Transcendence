// const fastify = require("fastify");
const fs = require("fs");

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
          			const DefaultImg = `http://127.0.0.1:3000/public/Default_pfp.jpg`;
					await fastify.db.run("INSERT INTO users(username, password, email) VALUES (?, ?, ?)", [data.username, data.password, data.email]);
          			const user_id = await fastify.db.get("SELECT id FROM users WHERE username = ?", [data.username]);
          			await fastify.db.run("INSERT INTO infos(profileImage, user_id) VALUES (?, ?)", [DefaultImg , user_id.id]);

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
				const data =  await fastify.db.all("SELECT id, username, email FROM users");
				reply.code(200).send(data);
			} catch {
				reply.code(500).send({ error: "Internal server error" });
			}
		});
		fastify.get('/users/:id', async (req, reply) => {
			try {
				const responseData = await fastify.db.get('SELECT id, username, email FROM users WHERE id = ?', [req.params.id]);
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
					const user = await fastify.db.get('SELECT username, password, id FROM users WHERE username = ? OR email = ?', [body.username, body.username]);
					if (user)
					{
						if (user.password != body.password)
							reply.code(401).send({message: "password not correct", success: false});
						else
						{
							const token = fastify.jwt.sign({userId: user.id, username: user.username}, { expiresIn: '1h' })
							reply.code(200).send({message: "login successfully", success: true, id: user.id, token: token});
						}
					}
					else
						reply.code(401).send({message: "go to signUp", success: false });
				}
				catch {
					reply.code(500).send({ error: "Internal server error", success: false });
				}
		});
}

module.exports = {
	sign_up,
	login,
	getUsers
  };
