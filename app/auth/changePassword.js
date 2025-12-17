import createError from 'http-errors';

async function change_password(req, reply) {
	const id = req.params.id;
	const data = req.body;

	if (!id || id == ':id')
		throw createError.BadRequest("Invalid User ID");

	const currentPassword = this.db.prepare("SELECT password FROM users WHERE id = ? and auth_provider = 'local'").get([id]);

	if (currentPassword && currentPassword.password == data.currentPassword) {
		this.db.prepare("UPDATE users SET password = ? WHERE id = ?").run([data.newPassword, id]);

		req.log.info({ userId: id }, "Password changed successfully");

		return ({ message: "Password updated successfully", success: true });
	}
	else
		throw createError.Unauthorized("The current password is incorrect");
}


export async function changePassword(fastify) {
	fastify.put("/auth/:id/settings-password", change_password);
}
