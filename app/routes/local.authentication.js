
function signUperrorHandler (error, request, reply)
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

async function signUpHandler(request, reply)
{
	let data = request.body;
	try {
		await this.db.run("INSERT INTO users(username, password, email) VALUES (?, ?, ?)", [data.username, data.password, data.email]);

		reply.code(201)
			 .send({message: "created", success: true});
		}
		catch (err) {
			console.error('Error inserting user:', err.message);
			reply.code(500)
				 .send({message: "this user is alredy exist !", success: false});
		}
}

async function loginHandler (req, reply)
{

	const body = req.body;
	try {
		const user = await this.db.get('SELECT username, password, auth_provider ,id FROM users WHERE username = ? OR email = ?', [body.username, body.username]);
		if (user && user.auth_provider == "local")
		{
			if (user.password != body.password)
				reply.code(401).send({message: "password not correct", success: false});
			else
			{
				const token = this.jwt.sign({userId: user.id, username: user.username}, { expiresIn: '1h' })
				console.log(token);
				reply.code(200).send({message: "login successfully", success: true, id: user.id, token: token});
			}
		}
		else if (user && user.auth_provider != "local")
			reply.code(401).send({message: `your can't login manual , must login with your auth_provider (${user.auth_provider}) `, success: false });
		else
			reply.code(401).send({message: "go to signUp", success: false });
	}
	catch {
		reply.code(500).send({ error: "Internal server error", success: false });
	}
}

async function getUsers(req, reply)
{
	try {
		const data =  await this.db.all("SELECT id, username, email FROM users");
		reply.code(200).send(data);
	} catch {
		reply.code(500).send({ error: "Internal server error" });
	}
}

async function getUserById(req, reply)
{
	try {
		const responseData = await this.db.get('SELECT id, username, email FROM users WHERE id = ?', [req.params.id]);
		reply.code(200).send(responseData);
	}
	catch {
		reply.code(500).send({ error: "Internal server error" });
	}
}

async function routes(fastify)
{
	try
	{
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
		}, loginHandler);
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
			errorHandler: signUperrorHandler
		}, signUpHandler);
		fastify.get("/users", getUsers);
		fastify.get('/users/:id', getUserById);

	}
	catch (err)
	{
		console.log(err);
		reply.code(500).send({message: "you cam't login"});
	}


}

module.exports = routes;
