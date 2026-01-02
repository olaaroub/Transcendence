import * as data from "./dashboard"
import { userData, IUserData, getImageUrl } from "./store";
import { navigate } from "../router";
import { confirmPopUp } from "./settings";
import { toastSuccess, toastError } from "./components/toast";
import { apiFetch } from "./components/errorsHandler";

const stats = [
	{ label: "XP", value: "2500" },
	{ label: "WINS", value: 150 },
	{ label: "LOSSES", value: 43 },
	{ label: "MATCHES", value: 193 },
];

function UserStats() : string
{
	return /* html */`
		<div class="flex gap-6 md:gap-8 2xl:gap-11 w-full">
			${stats.map(
				(stat)=>
					/* html */`
					<div class="${stat.label==="MATCHES" ? "w-[60%]" : "w-full"} rounded-2xl hover:bg-[#ff6a2071]
					bg-color4 glow-effect py-9 flex items-center flex-col hover:scale-105 transition-all duration-200 px-2">
						<p class="text-gray-400 text-lg lg:text-xl">${stat.label}</p>
						<p class="text-txtColor text-lg lg:text-3xl font-bold">${stat.value}</p>
					</div>
					`
			).join("")}
		</div>
	`;
}

function recentMatches() : string
{
	return /* html */ `
		<div class="w-full sm:px-4 p-6 bg-color4 glow-effect rounded-3xl">
			<h2 class="text-txtColor text-2xl font-bold">Recent Matches</h2>
		</div>
	`
}

async function getUserDataById(userId: string | null) : Promise<IUserData | null>
{
	if (!userId)
		return null;
	const tmpUserData = await data.fetchProfile(userId);
	if (!tmpUserData) {
		toastError('User data not found for ID: ' + userId);
		return null;
	}
	return tmpUserData;
}

export async function sendFriendRequest (receiverId: string | number | null) : Promise<void>{
	if (!receiverId) {
		toastError('Invalid user ID');
		return;
	}
	const { error } = await apiFetch(`/api/user/${userData.id}/add-friend?receiver_id=${receiverId}`, { 
		method: 'PUT',
		showErrorToast: true
	});
	if (error) {
		throw new Error(error.message || 'Failed to send friend request');
	}
	toastSuccess('Friend request sent successfully!');
}

export async function unfriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const { error } = await apiFetch(`/api/user/${userData.id}/delete-friend`, {
		headers: { "Content-Type": "application/json" },
		method: 'DELETE',
		body: JSON.stringify({ friend_id: friendId }),
		showErrorToast: true
	});
	if (error) {
		throw new Error(error.message || 'Failed to unfriend');
	}
	toastSuccess('Friend removed successfully!');
}

export async function blockFriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const { error } = await apiFetch(`/api/user/blockAndunblock-friend/${userData.id}`, {
		headers: { "Content-Type": "application/json" },
		method: 'PUT',
		body: JSON.stringify({ friend_id: friendId, block: true }),
		showErrorToast: true
	});
	if (error) {
		throw new Error(error.message || 'Failed to block friend');
	}
	setTimeout(() => {toastSuccess('Friend blocked successfully!');}, 100);
}

export async function unblockFriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const { error } = await apiFetch(`/api/user/blockAndunblock-friend/${userData.id}`, {
		headers: { "Content-Type": "application/json" },
		method: 'PUT',
		body: JSON.stringify({ friend_id: friendId, block: false }),
		showErrorToast: true
	});
	if (error) {
		throw new Error(error.message || 'Failed to unblock friend');
	}
	toastSuccess('Friend unblocked successfully!');
}

type FriendStatus = 'ACCEPTED' | 'BLOCKED' | 'PENDING' | 'NONE' | 'SELF';

function getActionButtonsHTML(status: FriendStatus): string {
	if (status === 'SELF') {
		return /* html */`
			<button id="edit-profile" class="bg-gradient-to-r from-color1 to-[#af4814]
			min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center">
				<img class="inline w-[24px] h-[24px]" src="images/edit.svg">Edit My Profile
			</button>`;
	}
	if (status === 'ACCEPTED') {
		return /* html */`
			<div class="flex gap-2">
				<button id="unfriend-btn" class="bg-gradient-to-r from-red-600 to-red-800
				min-w-[120px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
					<img class="inline w-[24px] h-[24px]" src="images/unfriend.svg" onerror="this.style.display='none'">Unfriend
				</button>
				<button id="block-btn" class="bg-gradient-to-r from-gray-600 to-gray-800
				min-w-[120px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
					<img class="inline w-[24px] h-[24px]" src="images/block.svg" onerror="this.style.display='none'">Block
				</button>
			</div>`;
	}
	if (status === 'BLOCKED') {
		return /* html */`
			<button id="unblock-btn" class="bg-gradient-to-r from-green-600 to-green-800
			min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
				<img class="inline w-[24px] h-[24px]" src="images/unblock.svg" onerror="this.style.display='none'">Unblock
			</button>`;
	}
	if (status === 'PENDING') {
		return /* html */`
			<button id="pending-btn" class="bg-gradient-to-r from-yellow-600 to-yellow-800
			min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center cursor-not-allowed opacity-70">
				<img class="inline w-[24px] h-[24px]" src="images/pending.svg" onerror="this.style.display='none'">Pending
			</button>`;
	}
	return /* html */`
		<button id="add-friend" class="bg-gradient-to-r from-color1 to-[#af4814]
		min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
			<img class="inline w-[24px] h-[24px]" src="images/addFriend.svg">Add Friend
		</button>`;
}

function updateActionButtonsUI(container: Element, status: FriendStatus, userId: string | null, tmpUserData: IUserData): void {
	const actionButtonsContainer = container.querySelector('#action-buttons-container');
	if (!actionButtonsContainer) return;

	actionButtonsContainer.innerHTML = getActionButtonsHTML(status);
	attachActionButtonListeners(container, status, userId, tmpUserData);
}

function attachActionButtonListeners(container: Element, status: FriendStatus, userId: string | null, tmpUserData: IUserData): void {
	container.querySelector('#edit-profile')?.addEventListener('click', () => {
		navigate('/settings');
	});

	container.querySelector('#add-friend')?.addEventListener('click', async () => {
		updateActionButtonsUI(container, 'PENDING', userId, tmpUserData);
		try {
			await sendFriendRequest(tmpUserData.id);
		} catch (error) {
			updateActionButtonsUI(container, 'NONE', userId, tmpUserData);
			toastError('Error sending friend request: ' + error);
		}
	});
	container.querySelector('#unfriend-btn')?.addEventListener('click', async () => {
		if (await confirmPopUp('Are you sure you want to unfriend this user?')) {
			const previousStatus: FriendStatus = 'ACCEPTED';
			updateActionButtonsUI(container, 'NONE', userId, tmpUserData);
			try {
				await unfriend(tmpUserData.id);
			} catch (error) {
				updateActionButtonsUI(container, previousStatus, userId, tmpUserData);
				toastError('Error unfriending: ' + error);
			}
		}
	});
	container.querySelector('#block-btn')?.addEventListener('click', async () => {
		if (await confirmPopUp('Are you sure you want to block this user?')) {
			const previousStatus: FriendStatus = 'ACCEPTED';
			updateActionButtonsUI(container, 'BLOCKED', userId, tmpUserData);
			try {
				await blockFriend(tmpUserData.id);
			} catch (error) {
				updateActionButtonsUI(container, previousStatus, userId, tmpUserData);
				toastError('Error blocking user: ' + error);
			}
		}
	});
	container.querySelector('#unblock-btn')?.addEventListener('click', async () => {
		const previousStatus: FriendStatus = 'BLOCKED';
		updateActionButtonsUI(container, 'NONE', userId, tmpUserData);
		try {
			await unblockFriend(tmpUserData.id);
		} catch (error) {
			updateActionButtonsUI(container, previousStatus, userId, tmpUserData);
			toastError('Error unblocking user: ' + error);
		}
	});
}

function getStatusFromString(status: string | null | undefined, isMyProfile: boolean): FriendStatus {
	if (isMyProfile) return 'SELF';
	const upperStatus = status?.toUpperCase();
	if (upperStatus === 'ACCEPTED') return 'ACCEPTED';
	if (upperStatus === 'BLOCKED') return 'BLOCKED';
	if (upperStatus === 'PENDING') return 'PENDING';
	return 'NONE';
}

export async function renderProfile(userId: string | null = null)
{
	await data.initDashboard(false);
	let tmpUserData : IUserData | null = null;
	const isMyProfile = userId == userData.id;
	if (isMyProfile)
		tmpUserData = userData;
	else
		tmpUserData = await getUserDataById(userId);
	
	if (!tmpUserData) return;

	const dashContent = document.getElementById('dashboard-content');
	if (dashContent) {
		const imageUrl = getImageUrl(tmpUserData.avatar_url);
		const currentStatus = getStatusFromString(tmpUserData.status, isMyProfile);

		dashContent.innerHTML = /* html */`
			<div class="profile-card w-full flex flex-col gap-6 2xl:gap-8">
				<div class="bg-color4 glow-effect mx-auto w-full rounded-3xl p-6 2xl:pl-12 flex gap-5 items-center
				border-t-4 border-color1">
					<img src="${imageUrl}" alt="avatar" class="w-[150px] h-[150px] rounded-full border-[3px] border-color1"/>
					<div class="flex flex-col gap-2">
						<h2 class="font-bold text-txtColor text-3xl">${tmpUserData.username}</h2>
						<p class="text-color3 mb-4 w-[70%]">${tmpUserData.bio}</p>
						<div id="action-buttons-container">
							${getActionButtonsHTML(currentStatus)}
						</div>
					</div>
				</div>
				${UserStats()}
				${recentMatches()}
			</div>
		`;

		const profileCard = document.querySelector('.profile-card');
		if (profileCard) {
			attachActionButtonListeners(profileCard, currentStatus, userId, tmpUserData);
		}
	}
}