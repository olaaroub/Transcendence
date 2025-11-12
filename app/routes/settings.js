/* 
SELECT u.id, u.email, u.username, i.profileImage, i.bio, f.status
	FROM
	users AS u INNER JOIN infos AS i ON u.id = i.user_id
	LEFT JOIN friendships AS f ON i.user_id = (
		CASE
        	WHEN f.userRequester = ? THEN f.userRequester
        	WHEN f.userReceiver = ?   THEN f.userReceiver
        END
	) 
*/


async function change_username(req, reply)
{
	const id = req.params.id;
	const body = req.body;
	console.log(body.username);
	try {
		await this.db.run("UPDATE users SET username = ? WHERE id = ?", [body.username, id]);
		reply.code(200).send({ message: "updating successfly username", success: true });
	} catch {
		reply.code(500).code({ message: "Error updating username", success: false });
	}
}

async function change_bio(req, reply)
{
	const id = req.params.id;
	const body = req.body;
	try {
		await this.db.run("UPDATE infos SET bio = ? WHERE id = ?", [body.bio, id]);
		reply.code(200).send({ message: "updating successfly bio", success: true });
	} catch {
		reply.code(500).code({ message: "Error updating bio", success: false });
	}    
}

async function change_password(req, reply)
{
	const id = req.params.id;
	const data = req.body;
	try {
		const currentPassword = await this.db.get("SELECT password FROM users WHERE id = ?", [id]);
		if (currentPassword.password == data.currentPassword)
		{
			await this.db.run("UPDATE users SET password = ? WHERE id = ?", [data.newPassword, id]);
			reply.code(200).send({ message: "updating successfly password", success: true });
		}
		else
		reply.code(401).send({ message: "you can't updating password", success: false });
	} catch (err) {
		console.log(err);
		reply.code(500).code({ message: "Error updating password", success: false });
	}
}

async function getProfileData(req, reply)
{
	try {
		const user_id = req.params.id;
		const profile_id = req.query.profile_id;
		let responceData;
		if (!profile_id)
		{
			responceData = await this.db.get(`SELECT users.id, users.email, users.username, infos.profileImage,infos.bio
												FROM users
												INNER JOIN infos ON users.id = infos.user_id
												WHERE users.id = ?`, [user_id]);
		}
		else
		{
			responceData = await this.db.get(`SELECT u.id, u.email, u.username, i.profileImage, i.bio, f.status
											  FROM
											  	users AS u INNER JOIN infos AS i ON u.id = i.user_id
												LEFT JOIN friendships AS f ON 
													(f.userRequester = ? AND f.userReceiver = ?) OR
        											(f.userReceiver = ? AND f.userRequester = ?)
												WHERE
													u.id = ?
												`, [user_id, profile_id, user_id, profile_id, profile_id]);
		}
		reply.code(200).send(responceData);

	} catch (err)
	{
		reply.code(500).send({success: false, message: "can't getProfileData"});
	}
}

function settingsRoutes(fastify) 
{
	fastify.put("/users/:id/settings-username", change_username);
	fastify.put("/users/:id/settings-bio", change_bio);
	fastify.put("/users/:id/settings-password", change_password);
	fastify.get("/users/:id/profile", getProfileData);
}


module.exports = settingsRoutes;