
async function change_password(req, reply) {
	const id = req.params.id;
	const data = req.body;
    if (id == ':id')
        reply.code(401).send({message: "the id is empty"})
	try {
		const currentPassword = this.db.prepare("SELECT password FROM users WHERE id = ? and auth_provider = 'local'").get([id]);
		if (currentPassword && currentPassword.password == data.currentPassword) {
			    this.db.prepare("UPDATE users SET password = ? WHERE id = ?").run([data.newPassword, id]);
			reply.code(200).send({ message: "updating successfly password", success: true });
		}
		else
			reply.code(401).send({ message: "you can't updating password", success: false });
	} catch (err) {
		console.log(err);
		reply.code(500).code({ message: "Error updating password", success: false });
	}
}


export async function changePassword(fastify)
{
    fastify.put("/auth/:id/settings-password", change_password);
}