
import createError from 'http-errors';

async function change_password(req, reply)
{
	const id = req.params.id;
	const data = req.body;
    if (id == ':id')
        reply.code(401).send({message: "the id is empty"})
	const currentPassword = this.db.prepare("SELECT password FROM users WHERE id = ? and auth_provider = 'local'").get([id]);
	if (currentPassword && currentPassword.password == data.currentPassword) {
			this.db.prepare("UPDATE users SET password = ? WHERE id = ?").run([data.newPassword, id]);
		return ({ message: "updating successfly password", success: true });
	}
	else
		createError.Unauthorized("the currentPassword not equal the oldpassword");
}


export async function changePassword(fastify)
{
    fastify.put("/auth/:id/settings-password", change_password);
}