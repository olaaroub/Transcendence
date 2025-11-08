import { IUserData } from "../store";

interface UserData {
	id: string;
	username: string;
}

export function renderNavBar (isLoged: boolean)
{
    return `
		<nav class="flex justify-between items-center p-6 sm:p-10">
			<img id="navBar-logo" class="w-[120px] sm:w-[155px] h-auto cursor-pointer" src="/images/logo.png" alt="pong" />
			<div  class=" ${isLoged ? "hidden" : ""} gap-3 sm:gap-5 flex">
				<button id="go-sign-up"
					class="py-2 px-4 sm:px-6 border text-color2 border-color2
					rounded-lg transition-all opacity-70 duration-500 hover:bg-color2
					hover:text-black font-bold text-sm sm:text-base">
					Sign Up
				</button>
				<button id="go-sign-in"
				class="py-2 px-4 sm:px-6 bg-[#F0F0F0] rounded-lg
				transition-all opacity-70 duration-500 hover:bg-color2
				font-bold text-sm sm:text-base">
				Login</button>
			</div>
		</nav>
    `
}

function searchBar() : string
{
	return `
		<div id="search-bar" class="relative w-[150px] mx-2 sm:w-[250px]
		md:w-[300px] lg:w-[400px] 2xl:w-[550px] bg-color4
		border border-color4 rounded-full
		flex items-center">
			<input
				id="search-input"
				type="text"
				autocomplete="off" 
				autocorrect="off" 
				autocapitalize="off" 
				spellcheck="false"
				placeholder="Search, users..."
				class="w-full bg-transparent text-gray-200 py-2
				px-4 outline-none placeholder:text-gray-500 sm:placeholder:text-sm placeholder:text-xs"
			/>
			<svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 w-6 h-6
			text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
			d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
			</svg>
		</div>
	`
}

const mockData = ["simo", "hamid", "karim"]

export function notifications()
{
	const notificationIcon = document.getElementById('notification-icon');
	if (!notificationIcon) return;
		notificationIcon.addEventListener('click', () => {
			const result = document.createElement('div');
			result.className = `absolute top-12 right-0 w-64 bg-color4 flex flex-col gap-6
			border border-color2 rounded-lg shadow-lg p-3 z-50 max-h-[300px] items-center`;
			result.id = "notifications-result";
			result.innerHTML = `
				<p class="text-txtColor text-lg font-bold text-center
				border-b border-color3 pb-3">Notifications</p>
			`
			for(const user of mockData)
			{
				const pandingUser = document.createElement('div');
				pandingUser.className = `flex gap-3 bg-color4`;
				pandingUser.innerHTML = `
					<img class="w-[30px] h-[30px] rounded-full" src="images/mmondad.jpeg" alt="">
					<span class="text-txtColor">${user}</span>
					<button class="bg-color1 rounded-2xl text-black">accept</button>
				`
				result.append(pandingUser);
			}
			notificationIcon.append(result);
		});
		document.addEventListener('click', (e) => {
			const el = e.target as HTMLElement;
			if (!notificationIcon.contains(el))
				notificationIcon.querySelector('#notifications-result')?.remove();
		});
}

export function renderDashboardNavBar(user: IUserData | null, imageUrl: string | null): string {
	return `
	<nav class="flex justify-between items-center py-14 w-full m-auto md:px-10 h-[70px] mb-7">
		<img id="main-logo" src="/images/logo.png"
		class="w-[100px] xl:w-[130px] my-10 xl:my-14 block cursor-pointer" />
		${searchBar()}
		<div class="flex items-center gap-3 mr-6">
			<div class="bg-color4 translate-y-[2px] rounded-full p-2">
				<img src="images/messageIcon.svg" class="w-[25px] h-[25px] invert
				sepia saturate-200 hue-rotate-[330deg]">
			</div>
			<div id="notification-icon"
			class="relative bg-color4 cursor-pointer translate-y-[2px] rounded-full p-2">
				<img src="images/notificationIcon.svg" class="w-[25px] h-[25px] invert
				sepia saturate-200 hue-rotate-[330deg]">
			</div>
			<!-- Profile Section -->
			<div class="flex items-center gap-3 ">
				<div id="avatar" class=" relative cursor-pointer
				transition-transform duration-300">
					<img src="${imageUrl}" class=" w-[50px] h-[50px] rounded-full
					border-2 border-transparent" alt="userAvatar"/>
					<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500
					border-2 border-[#0f2a3a] rounded-full"></span>
				</div>
				<p class="text-sm text-gray-200 font-bold">${user?.username}</p>
			</div>
		</div>
	</nav>
	`;
}
