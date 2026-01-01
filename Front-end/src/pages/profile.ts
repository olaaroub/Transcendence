import * as data from "./dashboard"
import { userData, IUserData, getImageUrl } from "./store";
import { navigate } from "../router";
import { confirmPopUp } from "./settings";
import { toastSuccess, toastError, toastWarning } from "./components/toast";

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
	const response = await fetch(`/api/user/${userData.id}/add-friend?receiver_id=${receiverId}`, { 
		headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
		method: 'PUT',
	})
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to send friend request');
	}
	
	setInterval( ()=>{toastSuccess('Friend request sent successfully!');}, 200);
}

export async function unfriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const response = await fetch(`/api/user/${userData.id}/delete-friend`, {
		headers: {
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
			"Content-Type": "application/json"
		},
		method: 'DELETE',
		body: JSON.stringify({ friend_id: friendId })
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to unfriend');
	}
	toastSuccess('Friend removed successfully!');
}

export async function blockFriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const response = await fetch(`/api/user/blockAndunblock-friend/${userData.id}`, {
		headers: {
			"Content-Type": "application/json"
		},
		method: 'PUT',
		body: JSON.stringify({ friend_id: friendId, block: true })
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to block friend');
	}
	setTimeout(() => {toastSuccess('Friend blocked successfully!');}, 100);

}

export async function unblockFriend(friendId: string | number | null): Promise<void> {
	if (!friendId) {
		toastError('Invalid user ID');
		return;
	}
	const response = await fetch(`/api/user/blockAndunblock-friend/${userData.id}`, {
		headers: {
			"Content-Type": "application/json"
		},
		method: 'PUT',
		body: JSON.stringify({ friend_id: friendId, block: false })
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to unblock friend');
	}
	toastSuccess('Friend unblocked successfully!');
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
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent) {
		const imageUrl = getImageUrl(tmpUserData?.avatar_url);
		const status = tmpUserData?.status?.toUpperCase();
		
		let actionButtons = '';
		if (isMyProfile) {
			actionButtons = /* html */`
				<button id="edit-profile" class="bg-gradient-to-r from-color1 to-[#af4814]
				min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center">
					<img class="inline w-[24px] h-[24px]" src="images/edit.svg">Edit My Profile
				</button>`;
		} else if (status === 'ACCEPTED') {
			actionButtons = /* html */`
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
		} else if (status === 'BLOCKED') {
			actionButtons = /* html */`
				<button id="unblock-btn" class="bg-gradient-to-r from-green-600 to-green-800
				min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
					<img class="inline w-[24px] h-[24px]" src="images/unblock.svg" onerror="this.style.display='none'">Unblock
				</button>`;
		} else if (status === 'PENDING') {
			actionButtons = /* html */`
				<button id="pending-btn" class="bg-gradient-to-r from-yellow-600 to-yellow-800
				min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center cursor-not-allowed opacity-70">
					<img class="inline w-[24px] h-[24px]" src="images/pending.svg" onerror="this.style.display='none'">Pending
				</button>`;
		} else {
			actionButtons = /* html */`
				<button id="add-friend" class="bg-gradient-to-r from-color1 to-[#af4814]
				min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center hover:opacity-80 transition-opacity">
					<img class="inline w-[24px] h-[24px]" src="images/addFriend.svg">Add Friend
				</button>`;
		}

		dashContent.innerHTML = /* html */`
			<div class="profile-card w-full flex flex-col gap-6 2xl:gap-8">
				<div class="bg-color4 glow-effect mx-auto w-full rounded-3xl p-6 2xl:pl-12 flex gap-5 items-center
				border-t-4 border-color1">
					<img src="${imageUrl}" alt="avatar" class="w-[150px] h-[150px] rounded-full border-[3px] border-color1"/>
					<div class="flex flex-col gap-2">
						<h2 class="font-bold text-txtColor text-3xl">${tmpUserData?.username}</h2>
						<p class="text-color3 mb-4 w-[70%]">${tmpUserData?.bio}</p>
						${actionButtons}
					</div>
				</div>
				${UserStats()}
				${recentMatches()}
			</div>
		`;
		const profileCard = document.querySelector('.profile-card');
		
		profileCard?.querySelector('#edit-profile')?.addEventListener('click', () => {
			navigate('/settings');
		});
		profileCard?.querySelector('#add-friend')?.addEventListener('click', async () => {
			try {
				await sendFriendRequest(tmpUserData!.id);
				renderProfile(userId);
			} catch (error) {
				toastError('Error sending friend request: ' + error);
			}
		});
		profileCard?.querySelector('#unfriend-btn')?.addEventListener('click', async () => {
			if (await confirmPopUp('Are you sure you want to unfriend this user?')) {
				try {
					await unfriend(tmpUserData!.id);
					renderProfile(userId);
				} catch (error) {
					toastError('Error unfriending: ' + error);
				}
			}
		});
		profileCard?.querySelector('#block-btn')?.addEventListener('click', async () => {
			if (await confirmPopUp('Are you sure you want to block this user?')) {
				try {
					await blockFriend(tmpUserData!.id);
					renderProfile(userId);
				} catch (error) {
					toastError('Error blocking user: ' + error);
				}
			}
		});
		profileCard?.querySelector('#unblock-btn')?.addEventListener('click', async () => {
			try {
				await unblockFriend(tmpUserData!.id);
				renderProfile(userId);
			} catch (error) {
				toastError('Error unblocking user: ' + error);
			}
		});
	}
}