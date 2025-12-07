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

SELECT u.id, u.email, u.username, u.profileImage, u.auth_provider,i.bio, f.status
											  FROM
													users AS u INNER JOIN infos AS i ON u.id = i.user_id
												LEFT JOIN friendships AS f ON
													(f.userRequester = ? AND f.userReceiver = ?) OR
													(f.userReceiver = ? AND f.userRequester = ?)
												WHERE
													u.id = ? AND (
													UPDATE
												)

*/


async function change_username(req, reply) {
	const id = req.params.id;
	const body = req.body;

	try {
		this.db.prepare("UPDATE users SET username = ? WHERE id = ?").run([body.username, id]);
		reply.code(200).send({ message: "updating successfly username", success: true });
	} catch {
		reply.code(500).code({ message: "Error updating username", success: false });
	}
}

async function change_bio(req, reply) {
	const id = req.params.id;
	const body = req.body;

	try {
		await this.db.prepare("UPDATE infos SET bio = ? WHERE user_id = ?").run([body.bio, id]);
		reply.code(200).send({ message: "updating successfly bio", success: true });
	} catch {
		reply.code(500).code({ message: "Error updating bio", success: false });
	}
}

async function change_password(req, reply) {
	const id = req.params.id;
	const data = req.body;
	try {
		const currentPassword = this.db.prepare("SELECT password FROM users WHERE id = ?").get([id]);
		if (currentPassword.password == data.currentPassword) {
			await this.db.prepare("UPDATE users SET password = ? WHERE id = ?").run([data.newPassword, id]);
			reply.code(200).send({ message: "updating successfly password", success: true });
		}
		else
			reply.code(401).send({ message: "you can't updating password", success: false });
	} catch (err) {
		console.log(err);
		reply.code(500).code({ message: "Error updating password", success: false });
	}
}

async function getProfileData(req, reply) {
	try {
		const user_id = req.userId;
		const profile_id = req.params.id;
		console.log(`user_id ${user_id} profile_id ${profile_id}`)
		// console.log(req.userId);
		let responceData = "";
		if (profile_id == user_id) {
			responceData = await this.db.prepare(`SELECT users.id, users.email, users.username, users.profileImage, users.auth_provider,infos.bio
												FROM users
												INNER JOIN infos ON users.id = infos.user_id
												WHERE users.id = ?`).get([user_id]);
		}
		else {
			responceData = await this.db.prepare(`SELECT u.id, u.email, u.username, u.profileImage, u.auth_provider,i.bio, f.status, f.blocker_id
											  FROM
											  	users AS u INNER JOIN infos AS i ON u.id = i.user_id
												LEFT JOIN friendships AS f ON
													(f.userRequester = ? AND f.userReceiver = ?) OR
        											(f.userReceiver = ? AND f.userRequester = ?)
												WHERE
													u.id = ?
												`).get([user_id, profile_id, user_id, profile_id, profile_id]);
			if (responceData.status == 'BLOCKED' && responceData.blocker_id == profile_id) {
				responceData.email = '';
				responceData.username = 'Pong User';
				responceData.profileImage = '/public/Default_pfp.jpg';
				responceData.bio = '--';
			}
			else if (responceData.status == 'BLOCKED' && responceData.blocker_id != profile_id) {
				responceData.bio = '--';
			}
			delete responceData.blocker_id;
		}
		console.log(responceData);
		reply.code(200).send(responceData);

	} catch (err) {
		reply.code(500).send({ success: false, message: "can't getProfileData" });
	}
}

function settingsRoutes(fastify) {
	fastify.put("/users/:id/settings-username", change_username);
	fastify.put("/users/:id/settings-bio", change_bio);
	fastify.put("/users/:id/settings-password", change_password);
	fastify.get("/users/:id/profile", getProfileData);
}


// module.exports = settingsRoutes;
export default settingsRoutes;