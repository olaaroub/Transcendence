import { notifications, renderDashboardNavBar } from "./components/NavBar";
import { navigate } from "../router";
import { renderGroupChat } from "./chat/groupChat";
import { renderProfileMenu } from "./components/profileMenu";
import { searchbar } from "./components/searchbar";
import { renderLeaderboard } from "./components/leaderboard";
import { showErrorMessage } from "./components/errorsHandler";
import { setUserData, userData, getImageUrl, credentials, IUserData, setCredentials} from "./store"
import { chatEventHandler } from "./chat/chat";

(window as any).navigate = navigate;

export let response: Response  | null = null;

export async function fetchProfile(userId: string | number | null) : Promise<IUserData | null> {
	if (!userId) {
		console.warn('User ID is null or undefined');
		return null;
	}
	let tmpUserData: IUserData | null = null;
	try {
		const response = await fetch(`/api/users/${userId}/profile`, {
			headers: { "Authorization": `Bearer ${credentials.token}` },
		});
		if (response.status === 401 || response.status === 403) {
			localStorage.clear();
			navigate('/login');
			return null;
		}
		try {
			tmpUserData = await response.json();
			if (tmpUserData && userId == credentials.id)
				setUserData(tmpUserData);
		} catch (parseErr) {
			console.error('Invalid JSON from API:', parseErr);
			showErrorMessage('Unexpected server response.', 502); // to test later
			return null;
		}
	}
	catch (err) {
		console.error('Network error:', err);
		showErrorMessage('Server unreachable. Try again later.', 503);
	}
	return tmpUserData;
}

export async function initDashboard(isDashboard: boolean = true) {
	setCredentials();
	const profileResponse = await fetchProfile(credentials.id);
	if (profileResponse)
		renderDashboard(isDashboard);
}

function LocalPong() : string
{
	return `
		<div class="relative ">
			
		<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)] hover:scale-[1.02] transition-all duration-300 rounded-3xl p-6 flex flex-col h-[400px]
		items-center md:items-start gap-8 overflow-visible relative">
			<div class="flex gap-6 items-center">
				<p class="text-color1 text-[50px] font-[900]" style="font-family: 'Pixelify Sans', sans-serif;">Local Pong</p>
			</div>
			<div class="flex h-full gap-3 justify-center w-full">
				${gameButtons('images/online.webp')}
				${gameButtons('images/online.webp')}
				${gameButtons('images/online.webp')}
			</div>

		</div>
		</div>
	`
}

function gameButtons(bg:string)
{
	return `
		<button class="rounded-2xl transition-all h-[250px]
		duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group">
			<img class="w-full h-full" src=${bg}></img>
		</button>
	`
}

function OnlinePong() : string
{
	return `
		<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)] hover:scale-[1.02] transition-all duration-300 rounded-3xl p-6 flex flex-col h-[400px]
		items-center md:items-start gap-8 overflow-visible relative" style="animation-delay: 0.5s;">
			<div class="flex gap-6 items-center">
				
				<p class="text-color1 text-[50px] font-[900]" style="font-family: 'Pixelify Sans', sans-serif;">Online Pong</p>
			</div>
			<div class="grid grid-cols-2 gap-3 w-[65%] h-full">
				${gameButtons('images/online.webp')}
				${gameButtons('images/online.webp')}
			</div>
			<div class="flex-shrink-0 self-center md:self-start md:absolute md:right-8
			lg:right-12 md:top-[65%] md:-translate-y-1/2">
				<img class="h-auto w-[280px] lg:w-[340px] xl:w-[380px]
				md:translate-x-[40px] md:-translate-y-[95px]
				object-contain drop-shadow-2xl" src="images/pongOnline.png" alt="">
			</div>
		</div>
	`
}

function renderWelcome() : string
{
	return `
		<div class="rounded-3xl grid grid-cols-1 xl:grid-cols-2 gap-6">
			${LocalPong()}
			${OnlinePong()}
		</div>
	`
}

function renderStatistics(): string {
	return `
		<div class="statistics mb-6">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Your Statistic</h2>
			<div class="bg-color4 glow-effect rounded-3xl text-txtColor grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Total Wins</p>
					<p class="text-4xl font-bold text-txtColor">127</p>
					<p class="text-sm text-color15">+12 this week</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Win Rate</p>
					<p class="text-4xl font-bold text-txtColor">74.7%</p>
					<p class="text-sm text-blue-600">Above average</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Current Streak</p>
					<p class="text-4xl font-bold text-txtColor">8</p>
					<p class="text-sm text-orange-400">Personal best!</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Rating</p>
					<p class="text-4xl font-bold text-txtColor">2847</p>
					<p class="text-sm text-[#8261BE]">Diamond III</p>
				</div>
			</div>
		</div>
	`;
}

function renderAnalyticsSection(): string {
	return `
		<div class="w-full md:w-[50%] h-[580px] flex flex-col justify-between">
			${renderLeaderboard()}
			${renderStatistics()}
		</div>
	`;
}

function renderDashboardContent(): string {
	return `
		<div class="flex flex-col md:flex-row gap-6 mt-6 w-full" >
			${renderAnalyticsSection()}
			${renderGroupChat()}
		</div>
	`;
}

async function renderMain() : Promise<string>
{
	return `
		<div class="w-full">
			<h2 class="font-bold mb-[20px] text-[#414658] text-3xl">Welcome back,
			<span class="text-txtColor text-3xl"> ${userData?.username}</span></h2>
			<div class="flex-1">${renderWelcome()}</div>
			${renderDashboardContent()}
		</div>
	`
}

function addClickInRightPanel()
{
	const friendsList = document.getElementById("friends-list");
	friendsList?.addEventListener("click", (e) => {
		const friendEl = (e.target as HTMLElement).closest(".friend-item");
		if (!friendEl) return;
		const friendId = friendEl.getAttribute("data-id");
		navigate('/profile/' + friendId);
	});
}

export async function renderDashboard(isDashboard: boolean = true)
{
	document.body.innerHTML = `
		<div class=" min-h-screen">
			<div class="absolute inset-0 bg-white opacity-10 blur-3xl z-[-1]"></div>
			<video class="fixed w-full h-full object-cover z-[-2]"
			loop
			autoplay
			muted
			playsinline
			<source src="images/bg.webm" type="video/webm">
			Your browser does not support the video tag.
			</video>
			${renderDashboardNavBar(userData, getImageUrl(userData?.profileImage))}
			<main id="dashboard-content" class="flex sm:w-[95%] w-[99%] m-auto">
				${isDashboard ? await renderMain() : ''}
			</main>
		</div>
	`;
	addClickInRightPanel();
	notifications();
	chatEventHandler();
	document.getElementById('main-logo')?.addEventListener('click', _=>{navigate('/dashboard');})
	const avatar = document.getElementById('avatar');
	if (avatar) {
		avatar.addEventListener('click', () => {
			let profile = avatar.querySelector('.profile-menu');
			if (profile) profile.remove();
			else avatar.appendChild(renderProfileMenu());
		});
		document.addEventListener('click', (e) => {
			const el = e.target as HTMLElement;
			if (!avatar.contains(el)) {
				let menu = avatar.querySelector('.profile-menu');
				if (menu) menu.remove();
			}
		});
	};
	searchbar();
}
