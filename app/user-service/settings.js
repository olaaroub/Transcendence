import createError from 'http-errors';

const ext = process.env.SERVICE_EXT || '-prod';
const AUTH_SERVICE_URL = `http://auth-service${ext}:3001`;

async function change_username(req, reply) {
	const id = req.params.id;
	const { username } = req.body;

	if (!username) throw createError.BadRequest("Username is required");

	this.db.prepare("UPDATE userInfo SET username = ? WHERE id = ?").run([username, id]);
	// khansni ndir lih update hta fe database tanya

	const changeAuthUserNameResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/changeUsername/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			"username": username
		})
	});

	if (!changeAuthUserNameResponse.ok) {
		req.log.error({ userId: id, status: changeAuthUserNameResponse.status }, "Failed to update username in Auth Service");
		throw createError.BadGateway("Failed to sync username change with Auth Service");
	}

	req.log.info({ userId: id, newUsername: username }, "Username updated successfully");

	return ({
		message: "Username updated successfully",
		success: true
	});
}

async function change_bio(req, reply) {
	const id = req.params.id;
	const { bio } = req.body;

	this.db.prepare("UPDATE userInfo SET bio = ? WHERE id = ?").run([bio, id]);
	req.log.info({ userId: id }, "User bio updated");

	return {
		message: "Bio updated successfully",
		success: true
	};
}

async function getProfileData(req, reply) {
	const user_id = req.userId;
	const profile_id = req.params.id;

	let responseData;

	if (profile_id == user_id) {
		responseData = this.db.prepare(`SELECT id, username, avatar_url, bio
										FROM userInfo
										WHERE id = ?`).get([user_id]);

		if (responseData) {
			const authProviderResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/provider/${user_id}`);
			if (authProviderResponse.ok) {
				const { auth_provider } = await authProviderResponse.json();
				responseData.auth_provider = auth_provider
			}
		}
	}
	else {
		responseData = this.db.prepare(`SELECT u.id, u.username, u.avatar_url, u.bio, f.status, f.blocker_id
										FROM userInfo AS u
										LEFT JOIN friendships AS f ON
											(f.userRequester = ? AND f.userReceiver = ?) OR
											(f.userReceiver = ? AND f.userRequester = ?)
										WHERE u.id = ?
										`).get([user_id, profile_id, user_id, profile_id, profile_id]);
		if (responseData) {
			if (responseData.status === 'BLOCKED') {
				if (responseData.blocker_id == profile_id) {
					responseData.username = 'Pong User';
					responseData.avatar_url = '/public/Default_pfp.jpg';
					responseData.bio = '--';
				} else {
					responseData.bio = '--';
				}
			}
			delete responseData.blocker_id;
		}
	}
	if (!responseData) {
		throw createError.NotFound("User not found");
	}

	return responseData;
}

function settingsRoutes(fastify) {
	fastify.put("/user/:id/settings-username", change_username);
	fastify.put("/user/:id/settings-bio", change_bio);
	// fastify.put("/users/:id/settings-password", change_password);
	fastify.get("/user/:id/profile", getProfileData);
}


export default settingsRoutes;
