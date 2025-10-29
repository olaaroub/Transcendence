import * as data from "./dashboard"

function UserStats() : string
{
	return `
		<div class="flex gap-6 w-full">
			<div class=" sm:px-4 p-6 rounded-3xl border flex-1 flex justify-between border-color2 bg-color4">
				<div class="flex flex-col gap-4">
					<img src="images/followers.svg" alt="">
					<h2 class="text-txtColor font-bold text-2xl w-[50px] h-[50px]">FOLLOWERS</h2>
				</div>
				<span class="font-bold text-3xl text-color1">1</span>
			</div>
			<div class=" sm:px-4 p-6 rounded-3xl border flex-1 flex justify-between border-color2 bg-color4">
				<div class="flex flex-col gap-4">
					<img src="images/following.svg" alt="">
					<h2 class="text-txtColor font-bold text-2xl w-[50px] h-[50px]">FOLLOWING</h2>
				</div>
				<span class="font-bold text-3xl text-color1">1</span>
			</div>
		</div>
	`;
}

function recentMatches() : string
{
	return `
		<div class="w-full sm:px-4 p-6 bg-color4 border border-color2 rounded-3xl">
			<h2 class="text-txtColor text-2xl font-bold">Recent Matches</h2>
			
		</div>
	`
}

export async function renderProfile()
{
	if (!data.userData || !data.userData.id || !data.userData.username)
		await data.initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent) {
		console.log(data.imageUrl);
		dashContent.innerHTML = `
			<div class="profile-card w-full flex flex-col gap-4">
				<div class="sm:px-4 bg-color4 mx-auto w-full rounded-3xl p-6 flex gap-5 items-center
				border border-color2">
					<img src="${data.imageUrl}" alt="avatar" class="w-[150px] h-[150px]"/>
					<div class="flex flex-col gap-2">
						<h2 class="font-bold text-txtColor text-3xl">SIMO</h2>
						<p class="text-color3 text-sm mb-4 w-[70%]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat magnam quisquam 
						hic atque quaerat, cum, odit ad eligendi aliquam optio tenetur deserunt, saepe ex sit officia corporis ullam dolore ab!</p>
						<button class="bg-gradient-to-r from-color1  to-[#af4814]
						w-[130px] rounded-2xl font-bold p-2 px-6">FOLLOW</button>
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
			list.contains('from-color1') ? list.replace('from-color1', 'from-color2') : list.replace('from-color2', 'from-color1');
			list.contains('from-color1') ? target.textContent = 'FOLLOW' : target.textContent = 'FOLLOWED';
		})
	}
}