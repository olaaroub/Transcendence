import createError from 'http-errors';


async function change_username(req, reply) {
	const id = req.params.id;
	const { username } = req.body;

	this.db.prepare("UPDATE userInfo SET username = ? WHERE id = ?").run([username, id]);
	// khansni ndir lih update hta fe database tanya
	const changeAuthUserNameResponse = await fetch(`http://auth-service-dev:3001/api/auth/changeUsername/${id}`, {
		method: 'PUT',
		headers: {
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({
			"username": username
		})
	});
	if (!changeAuthUserNameResponse.ok)
		throw createError.BadGateway("can't change the username in auth-service");
	return ({ 
		message: "updating successfly username",
		success: true
	});

}

async function change_bio(req, reply) {
	const id = req.params.id;
	const body = req.body;

	this.db.prepare("UPDATE userInfo SET bio = ? WHERE id = ?").run([body.bio, id]);
	return ({
		message: "updating successfly bio",
		success: true
	});
}

async function getProfileData(req, reply) {
	const user_id = req.userId;
	const profile_id = req.params.id;
	console.log(`user_id ${user_id} profile_id ${profile_id}`)

	let responceData;
	if (profile_id == user_id) {
		responceData = this.db.prepare(`SELECT id, username, avatar_url, bio
										FROM userInfo
										WHERE id = ?`).get([user_id]);

		const authProviderResponse = await fetch(`http://auth-service-dev:3001/api/auth/provider/${user_id}`);
		// console.log(authProviderResponse.status)
		if (authProviderResponse.status != '200')
			return responceData;
		const { auth_provider } = await authProviderResponse.json();
		responceData.auth_provider = auth_provider
		console.log(responceData);

	}
	else {
		responceData = this.db.prepare(`SELECT u.id, u.username, u.avatar_url, u.bio, f.status, f.blocker_id
										FROM
										userInfo AS u
										LEFT JOIN friendships AS f ON
											(f.userRequester = ? AND f.userReceiver = ?) OR
											(f.userReceiver = ? AND f.userRequester = ?)
										WHERE
											u.id = ?
										`).get([user_id, profile_id, user_id, profile_id, profile_id]);
		if (responceData.status == 'BLOCKED' && responceData.blocker_id == profile_id) {
			responceData.username = 'Pong User';
			responceData.avatar_url = '/public/Default_pfp.jpg';
			responceData.bio = '--';
		}
		else if (responceData.status == 'BLOCKED' && responceData.blocker_id != profile_id) {
			responceData.bio = '--';
		}
		delete responceData.blocker_id;
	}
	req.log.info(responceData, "data of profile geting successfully");
	return responceData;

}

function settingsRoutes(fastify) {
	fastify.put("/user/:id/settings-username", change_username);
	fastify.put("/user/:id/settings-bio", change_bio);
	// fastify.put("/users/:id/settings-password", change_password);
	fastify.get("/user/:id/profile", getProfileData);
}


// module.exports = settingsRoutes;
export default settingsRoutes;
