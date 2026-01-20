import createError from 'http-errors';
import { changeItemInOtherService } from './utils.js';

const ext = process.env.SERVICE_EXT || '-prod';
const AUTH_SERVICE_URL = `http://auth-service${ext}:3001`;
const GLOBAL_CHAT_SERVICE_URL = `http://global-chat${ext}:3003`;

async function change_username(req) {
	const id = req.params.id;
	const { username } = req.body;

	if (!username) throw createError.BadRequest("Username is required");

	try {
		this.db.prepare("UPDATE userInfo SET username = ? WHERE id = ?").run([username, id]);
	} catch(err)
	{
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			throw createError.Conflict("User with this username already exists");
		}
		throw err;
	}

	await changeItemInOtherService(`${AUTH_SERVICE_URL}/api/auth/changeUsername/${id}`, { username });
	await changeItemInOtherService(`${GLOBAL_CHAT_SERVICE_URL}/api/chat/global/username/${id}`, { username });

	req.log.info({ userId: id, newUsername: username }, "Username updated successfully");

	return ({
		message: "Username updated successfully",
		success: true
	});
}


async function change_bio(req) {
	const id = req.params.id;
	const { bio } = req.body;

	this.db.prepare("UPDATE userInfo SET bio = ? WHERE id = ?").run([bio, id]);
	req.log.info({ userId: id }, "User bio updated");

	return {
		message: "Bio updated successfully",
		success: true
	};
}

async function getProfileData(req) {
	const user_id = req.userId;
	const profile_id = req.params.id;

	let responseData;

	if (profile_id == user_id) {
		responseData = this.db.prepare(`SELECT id, username, avatar_url, bio, Rating, TotalWins, TotalLosses, GamesPlayed
										FROM userInfo
										WHERE id = ?`).get([user_id]);

		if (responseData) {
			const authProviderResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/provider/${user_id}`);
			if (authProviderResponse.ok) {
				let { auth_provider, email } = await authProviderResponse.json();
				responseData.auth_provider = auth_provider;
				responseData.email = email;
			}
			else {
				responseData.auth_provider = 'unknown';
				responseData.email = 'unknown';
			}
		}
	}
	else {
		responseData = this.db.prepare(`SELECT u.id, u.username, u.avatar_url, u.bio, u.Rating, u.TotalWins, u.TotalLosses, u.GamesPlayed, f.status, f.blocker_id
										FROM userInfo AS u
										LEFT JOIN friendships AS f ON
											(f.userRequester = ? AND f.userReceiver = ?) OR
											(f.userReceiver = ? AND f.userRequester = ?)
										WHERE u.id = ?
										`).get([user_id, profile_id, user_id, profile_id, profile_id]);
		if (responseData) {
			if (responseData.status === 'BLOCKED') {
				if (responseData.blocker_id == profile_id) {
					const updatedProfile = {
							id: responseData.id,
							username: 'Pong User',
							avatar_url: '/public/default_pfp.png',
							bio: '--',
							status: null,
							Rating: 0, TotalWins: 0, TotalLosses: 0, GamesPlayed: 0
						}
					responseData = updatedProfile;
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
	req.log.debug("user profile: ", responseData);
	return responseData;
}

function settingsRoutes(fastify) {
	fastify.put("/user/:id/settings-username", change_username);
	fastify.put("/user/:id/settings-bio", change_bio);
	fastify.get("/user/:id/profile", getProfileData);
}


export default settingsRoutes;
