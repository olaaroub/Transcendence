import * as data from "./dashboard"
import { IUserData } from "./store";

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

export async function renderProfile(isMyProfile: boolean, userData: IUserData | null = data.userData)
{
	if (!data.userData || !data.userData.id || !data.userData.username)
		await data.initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent) {
		dashContent.innerHTML = `
			<div class="profile-card w-full flex flex-col gap-6 2xl:gap-8">
				<div class="bg-color4 mx-auto w-full rounded-3xl p-6 2xl:pl-12 flex gap-5 items-center
				border-t-4 border-color1">
					<img src="${userData?.profileImage}" alt="avatar" class="w-[150px] h-[150px] rounded-full border-[3px] border-color1"/>
					<div class="flex flex-col gap-2">
						<h2 class="font-bold text-txtColor text-3xl">${userData?.username}</h2>
						<p class="text-color3 mb-4 w-[70%]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat magnam quisquam 
						hic atque quaerat, cum, odit ad eligendi aliquam optio tenetur deserunt, saepe ex sit officia corporis ullam dolore ab!</p>
						<button class="bg-gradient-to-r from-color1 to-[#af4814]
						w-[150px] rounded-xl text-lg font-bold p-3 flex gap-2 justify-center">
						<img class="inline" src="images/addFriend.svg" alt="add friend">Add Friend</button>
					</div>
				</div>
				${UserStats()}
				${recentMatches()}
			</div>
		`;
		const profile_card = document.querySelector('.profile-card');
		profile_card?.querySelector('button')?.addEventListener('click', el=>{
			const target = el.target as HTMLButtonElement;
			const list = target.classList;
			// list.contains('from-color1') ? list.replace('from-color1', 'from-color2') : list.replace('from-color2', 'from-color1');
			// list.contains('from-color1') ? target.textContent = 'FOLLOW' : target.textContent = 'FOLLOWED';
		})
	}
}