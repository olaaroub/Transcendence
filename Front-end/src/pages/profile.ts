import * as data from "./dashboard"
import { userData, IUserData, getImageUrl } from "./store";
import { navigate } from "../router";

const stats = [
	{ label: "XP", value: "2500" },
	{ label: "WINS", value: 150 },
	{ label: "LOSSES", value: 43 },
	{ label: "MATCHES", value: 193 },
];

function UserStats() : string
{
	return `
		<div class="flex gap-6 md:gap-8 2xl:gap-11 w-full">
			${stats.map(
				(stat)=>
					`
					<div class="${stat.label==="MATCHES" ? "w-[60%]" : "w-full"} rounded-2xl hover:bg-[#ff6a2071]
					bg-color4 py-9 flex items-center flex-col hover:scale-105 transition-all duration-200 px-2">
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
	return `
		<div class="w-full sm:px-4 p-6 bg-color4 rounded-3xl">
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
		alert('User data not found for ID: ' + userId);
		return null;
	}
	return tmpUserData;
}

export async function sendFriendRequest (receiverId: string | number | null) : Promise<void>{
	if (!receiverId) {
		alert('Invalid user ID');
		return;
	}
	const response = await fetch(`/api/users/${userData.id}/add-friend?receiver_id=${receiverId}`, {
		method: 'PUT',
	})
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to send friend request');
	}
	alert('Friend request sent successfully!');
}

export async function renderProfile(userId: string | null = null)
{
	if (!userData || !userData.id || !userData.username)
		await data.initDashboard(false);
	let tmpUserData : IUserData | null = null;
	const isMyProfile = userId == userData.id;
	if (isMyProfile)
		tmpUserData = userData;
	else
		tmpUserData = await getUserDataById(userId);

	const dashContent = document.getElementById('dashboard-content');
	if (dashContent) {
		const imageUrl = getImageUrl(tmpUserData?.profileImage);

		dashContent.innerHTML = `
			<div class="profile-card w-full flex flex-col gap-6 2xl:gap-8">
				<div class="bg-color4 mx-auto w-full rounded-3xl p-6 2xl:pl-12 flex gap-5 items-center
				border-t-4 border-color1">
					<img src="${imageUrl}" alt="avatar" class="w-[150px] h-[150px] rounded-full border-[3px] border-color1"/>
					<div class="flex flex-col gap-2">
						<h2 class="font-bold text-txtColor text-3xl">${tmpUserData?.username}</h2>
						<p class="text-color3 mb-4 w-[70%]">${tmpUserData?.bio}</p>
						<button id="${isMyProfile ? 'edit-profile' : 'add-friend'}" class="bg-gradient-to-r from-color1 to-[#af4814]
						min-w-[150px] rounded-xl text-lg font-bold px-4 py-2 flex gap-2 justify-center">
					<img class="inline w-[24px] h-[24px]" src="${isMyProfile ? 'images/edit.svg' : 'images/addFriend.svg'}">${isMyProfile ? 'Edit My Profile' : 'Add Friend'}</button>
					</div>
				</div>
				${UserStats()}
				${recentMatches()}
			</div>
		`;
		const profile_card = document.querySelector('.profile-card');
		profile_card?.querySelector('button')?.addEventListener('click', async el=>{
			if (isMyProfile) {
				navigate('/settings');
				return;
			}
			try {
				await sendFriendRequest(tmpUserData!.id);
			} catch (error) {
				alert('Error sending friend request: ' + error);
			}
		})

	}
}