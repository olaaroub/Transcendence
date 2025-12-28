import { notifications, renderDashboardNavBar } from "./components/NavBar";
import { navigate } from "../router";
import { renderGlobalChat } from "./chat/globalChat";
import { renderProfileMenu } from "./components/profileMenu";
import { searchbar } from "./components/searchbar";
import { dashboardLearderboard } from "./components/leaderboard";
import { showErrorMessage } from "./components/errorsHandler";
import { setUserData, userData, getImageUrl, credentials, IUserData, setCredentials} from "./store"
import { chatEventHandler } from "./chat/chat";

// (window as any).navigate = navigate;
const $ = (id : string) => document.getElementById(id as string);

export let response: Response  | null = null;

export async function fetchProfile(userId: string | number | null) : Promise<IUserData | null> {
	if (!userId) {
		console.warn('User ID is null or undefined');
		return null;
	}
	let tmpUserData: IUserData | null = null;
	try {
		const response = await fetch(`/api/user/${userId}/profile`, {
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
	return /* html */ `
		<div class="relative">
			<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)]
			transition-all duration-300 rounded-3xl px-6 py-6 flex flex-col h-[400px]
			items-center md:items-start gap-4 overflow-visible relative">
				<p class="text-color1 text-[50px] font-[900]" style="font-family: 'Pixelify Sans', sans-serif;">Local Pong</p>
				<div class="flex h-full gap-4 justify-center w-full">
					<!-- Vs Player Button -->
					<button id="btn-local-vs-player" class="group relative flex-1 bg-black/50 
						rounded-2xl border border-borderColor 
						hover:border-color1 transition-all duration-300 
						hover:bg-color1/10 overflow-hidden cursor-pointer">
						<div class="h-full flex flex-col items-center justify-center gap-4 p-4">
							<div class="w-16 h-16 rounded-full bg-color1/20 flex items-center justify-center
								group-hover:bg-color1/30 group-hover:scale-110 transition-all duration-300">
								<svg class="w-8 h-8 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
							</div>
							<span class="text-txtColor font-bold text-xl group-hover:text-color1 transition-colors duration-300">Vs Player</span>
							<span class="text-color3 text-sm text-center">1v1 Local Match</span>
						</div>
					</button>
					<button id="btn-local-vs-ai" class="group relative flex-1 bg-black/50 
						rounded-2xl border border-borderColor 
						hover:border-color2 transition-all duration-300 
						hover:bg-color2/10 overflow-hidden cursor-pointer">
						<div class="h-full flex flex-col items-center justify-center gap-4 p-4">
							<div class="w-16 h-16 rounded-full bg-color2/20 flex items-center justify-center
								group-hover:bg-color2/30 group-hover:scale-110 transition-all duration-300">
								<svg class="w-8 h-8 text-color2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
								</svg>
							</div>
							<span class="text-txtColor font-bold text-xl group-hover:text-color2 transition-colors duration-300">Vs AI</span>
							<span class="text-color3 text-sm text-center">Challenge the Bot</span>
						</div>
					</button>
					<button id="btn-local-tournament" class="group relative flex-1 bg-black/50 
						rounded-2xl border border-borderColor 
						hover:border-color1 transition-all duration-300 
						hover:bg-color1/10 overflow-hidden cursor-pointer">
						<div class="h-full flex flex-col items-center justify-center gap-4 p-4">
							<div class="w-16 h-16 rounded-full bg-color1/20 flex items-center justify-center
								group-hover:bg-color1/30 group-hover:scale-110 transition-all duration-300">
								<svg class="w-8 h-8 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
								</svg>
							</div>
							<span class="text-txtColor font-bold text-xl group-hover:text-color1 transition-colors duration-300">Tournament</span>
							<span class="text-color3 text-sm text-center">Local Competition</span>
						</div>
					</button>
				</div>
			</div>
		</div>
	`
}

function OnlinePong() : string
{
	return /* html */ `
		<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)] transition-all
		duration-300 rounded-3xl px-6 py-6 flex flex-col h-[400px] items-center md:items-start gap-4
		overflow-visible relative" style="animation-delay: 0.5s;">
			<p class="text-color1 text-[50px] font-[900]" style="font-family: 'Pixelify Sans', sans-serif;">Online Pong</p>
			<div class="flex gap-4 w-full md:w-[65%] h-full">
				<button id="btn-online-matchmaking" class="group relative flex-1 bg-black/50 
					rounded-2xl border border-borderColor 
					hover:border-color1 transition-all duration-300 
					hover:bg-color1/10 overflow-hidden cursor-pointer">
					<div class="h-full flex flex-col items-center justify-center gap-4 p-4">
						<div class="w-16 h-16 rounded-full bg-color1/20 flex items-center justify-center
							group-hover:bg-color1/30 group-hover:scale-110 transition-all duration-300">
							<svg class="w-8 h-8 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
						</div>
						<span class="text-txtColor font-bold text-xl group-hover:text-color1 transition-colors duration-300">MatchMaking</span>
						<span class="text-color3 text-sm text-center">Find Opponent</span>
					</div>
				</button>
				<button id="btn-online-tournament" class="group relative flex-1 bg-black/50 
					rounded-2xl border border-borderColor 
					hover:border-color2 transition-all duration-300 
					hover:bg-color2/10 overflow-hidden cursor-pointer">
					<div class="h-full flex flex-col items-center justify-center gap-4 p-4">
						<div class="w-16 h-16 rounded-full bg-color2/20 flex items-center justify-center
							group-hover:bg-color2/30 group-hover:scale-110 transition-all duration-300">
							<svg class="w-8 h-8 text-color2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
							</svg>
						</div>
						<span class="text-txtColor font-bold text-xl group-hover:text-color2 transition-colors duration-300">Tournament</span>
						<span class="text-color3 text-sm text-center">Online Competition</span>
					</div>
				</button>
			</div>
			<div class="flex-shrink-0 self-center md:self-start md:absolute md:right-8
			lg:right-0 md:top-[65%] md:-translate-y-1/2">
				<img class="h-auto w-[280px] lg:w-[340px] xl:w-[380px]
				md:translate-x-[40px] md:-translate-y-[95px]
				object-contain drop-shadow-2xl" src="images/pongOnline.png" alt="">
			</div>
		</div>
	`
}

function renderWelcome() : string
{
	return /* html */ `
		<div class="rounded-3xl grid grid-cols-1 xl:grid-cols-2 gap-6">
			${LocalPong()}
			${OnlinePong()}
		</div>
	`
}

function renderStatistics(): string {
	return /* html */ `
		<div class="statistics mb-6">
			<h2 class="text-txtColor font-bold text-2xl mb-4 transition-all duration">Your Statistic</h2>
			<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 glow-effect rounded-3xl
			text-txtColor grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
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
			${dashboardLearderboard()}
			${renderStatistics()}
		</div>
	`;
}

function renderDashboardContent(): string {
	return `
		<div class="flex flex-col md:flex-row gap-6 mt-6 w-full" >
			${renderAnalyticsSection()}
			${renderGlobalChat()}
		</div>
	`;
}

async function renderMain() : Promise<string>
{
	return /* html */`
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
	const friendsList = $("friends-list");
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
			<div class="absolute inset-0 bg-black opacity-70 blur-3xl z-[-1]"></div>
			<video class="fixed w-full h-full object-cover z-[-2]"
			loop
			autoplay
			muted
			playsinline
			<source src="images/bg.webm" type="video/webm">
			Your browser does not support the video tag.
			</video>
			${renderDashboardNavBar(userData, getImageUrl(userData?.avatar_url))}
			<main id="dashboard-content" class="flex sm:w-[95%] w-[99%] m-auto">
				${isDashboard ? await renderMain() : ''}
			</main>
		</div>
	`;

	// const playBtn = $('btn-play-local'); /// ana
    // if (playBtn) {
    //     playBtn.addEventListener('click', () => {
    //         // 1. Swap the screen to the Game Iframe
    //         // This destroys the Dashboard HTML and loads the Game Container via Nginx
    //         document.body.innerHTML = `

    //             <style>
    //                 body { margin: 0; background: #000; height: 100vh; overflow: hidden; }
    //                 iframe { width: 100%; height: 100%; border: none; display: block; }
    //                 .exit-btn {
    //                     position: absolute; top: 20px; left: 20px; z-index: 999;
    //                     background: rgba(255, 255, 255, 0.1); color: white;
    //                     border: 1px solid rgba(255, 255, 255, 0.5);
    //                     padding: 10px 20px; cursor: pointer; font-family: sans-serif;
    //                     border-radius: 8px; backdrop-filter: blur(4px);
    //                     transition: all 0.2s;
    //                 }
    //                 .exit-btn:hover { background: rgba(255, 0, 0, 0.5); border-color: red; }
    //             </style>
    //             <button id="exit-game-btn" class="exit-btn">← EXIT GAME</button>
    //             <iframe src="/game/index.html"></iframe>
    //         `;

    //         // 2. Add the listener for the Exit Button
    //         // When clicked, we simply call renderDashboard() again.
    //         // This destroys the Iframe (cleaning up the game memory) and redraws your UI.
    //         document.getElementById('exit-game-btn')?.addEventListener('click', () => {
    //             renderDashboard();
    //         });
    //     });
    // }

	$('see-more')?.addEventListener('click', _=>{navigate('/leaderboard');})
	addClickInRightPanel();
	notifications();
	chatEventHandler();
	$('main-logo')?.addEventListener('click', _=>{navigate('/dashboard');})
	const avatar = $('avatar');
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
