import { notifications, renderDashboardNavBar } from "./components/NavBar";
import { navigate } from "../router";
import { renderGlobalChat } from "./chat/globalChat";
import { renderProfileMenu } from "./components/profileMenu";
import { searchbar } from "./components/searchbar";
import { dashboardLearderboard } from "./components/leaderboard";
import { apiFetch, showErrorMessage } from "./components/errorsHandler";
import { setUserData, userData, getImageUrl, credentials, IUserData, setCredentials} from "./store"
import { chatEventHandler } from "./chat/chat";
import { showDifficultyModal } from "./components/difficultyModal";

// (window as any).navigate = navigate;
const $ = (id : string) => document.getElementById(id as string);

export let response: Response  | null = null;

export async function fetchProfile(userId: string | number | null) : Promise<IUserData | null> {
	if (!userId) {
		console.warn('User ID is null or undefined');
		return null;
	}
	const { data, error } = await apiFetch<IUserData>(`/api/user/${userId}/profile`, {
		showErrorToast: false
	});
	if (error) {
		if (error.isNetworkError)
			showErrorMessage('Server unreachable. Try again later.', 503);
		return null;
	}
	if (data && userId == credentials.id)
		setUserData(data);
	return data;
}

export async function initDashboard(isDashboard: boolean = true) {
	setCredentials();
	const profileResponse = await fetchProfile(credentials.id);
	if (profileResponse)
		renderDashboard(isDashboard);
}

function renderGameModeButton(id: string, colorClass: string, icon: string, title: string, description: string): string {
	return /* html */ `
		<button id="${id}" class="group relative bg-[#0f0f1a] hover:bg-[#1a1a2e] 
			rounded-xl p-5 border border-white/5 hover:border-${colorClass}/50 
			transition-all duration-200 cursor-pointer text-left">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-10 h-10 rounded-lg bg-${colorClass}/10 group-hover:bg-${colorClass}/20 
					flex items-center justify-center transition-colors duration-200">
					<svg class="w-5 h-5 text-${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						${icon}
					</svg>
				</div>
				<span class="text-white font-medium group-hover:text-${colorClass} transition-colors duration-200">${title}</span>
			</div>
			<p class="text-gray-500 text-sm">${description}</p>
		</button>
	`;
}

function LocalPong() : string
{
	const localModes = [
		{
			id: 'btn-local-vs-player',
			colorClass: 'color1',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>',
			title: '1v1 Player',
			description: 'Challenge a friend locally'
		},
		{
			id: 'btn-local-vs-ai',
			colorClass: 'color2',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>',
			title: 'Vs AI',
			description: 'Test your skills against AI'
		}
	];

	return /* html */ `
		<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] glow-effect rounded-2xl p-6
		transition-all duration-300 border border-white/5">
			<div class="flex items-center gap-3 mb-6">
				<h3 class="text-white text-2xl font-bold">Local Pong</h3>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				${localModes.map(mode => renderGameModeButton(mode.id, mode.colorClass, mode.icon, mode.title, mode.description)).join('')}
			</div>
		</div>
	`
}

function OnlinePong() : string
{
	const onlineModes = [
		{
			id: 'btn-online-matchmaking',
			colorClass: 'color1',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>',
			title: 'Matchmaking',
			description: 'Find a ranked opponent'
		},
		{
			id: 'btn-online-room',
			colorClass: 'color2',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>',
			title: 'Join Room',
			description: 'Join competitive brackets'
		}
	];

	return /* html */ `
		<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] glow-effect rounded-2xl p-6
		transition-all duration-300 border border-white/5">
			<div class="flex items-center gap-3 mb-6">
				<h3 class="text-white text-2xl font-bold">Online Pong</h3>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				${onlineModes.map(mode => renderGameModeButton(mode.id, mode.colorClass, mode.icon, mode.title, mode.description)).join('')}
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
			<h2 class="text-txtColor font-bold text-xl sm:text-2xl mb-3 sm:mb-4 transition-all duration">Your Statistic</h2>
			<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 glow-effect rounded-2xl sm:rounded-3xl
			text-txtColor grid grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Total Wins</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">127</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Win Rate</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">74.7%</p>
					<p class="text-xs sm:text-sm text-blue-600 mt-1">Above average</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Current Streak</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">8</p>
					<p class="text-xs sm:text-sm text-orange-400 mt-1">Personal best!</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Rating</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">2847</p>
					<p class="text-xs sm:text-sm text-[#8261BE] mt-1">Diamond III</p>
				</div>
			</div>
		</div>
	`;
}

function renderAnalyticsSection(): string {
	return `
		<div class="w-full md:w-[50%] h-[580px] flex flex-col justify-between">
			<div id="dashboard-leaderboard"></div>
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

function mainBackground() : string
{
	return `
		<video
		class="fixed top-0 left-0 w-full h-full object-cover z-[-2] pointer-events-none"
		autoplay
		muted
		loop
		playsinline
		preload="auto"
		disablepictureinpicture
		tabindex="-1"
		aria-hidden="true"
		style="pointer-events: none;"
		>
		<source src="images/bg.webm" type="video/webm">
		</video>
	`
}

export async function renderDashboard(isDashboard: boolean = true)
{
	document.body.innerHTML = `
		<div class=" min-h-screen">
			${mainBackground()}
			${renderDashboardNavBar(userData, getImageUrl(userData?.avatar_url))}
			<main id="dashboard-content" class="flex sm:w-[95%] w-[99%] m-auto">
				${isDashboard ? await renderMain() : ''}
			</main>
		</div>
	`;

	if (isDashboard) {
		const leaderboardContainer = $('dashboard-leaderboard');
		if (leaderboardContainer) {
			leaderboardContainer.innerHTML = await dashboardLearderboard();
		}
	}

	$('see-more')?.addEventListener('click', _=>{navigate('/leaderboard');})
	notifications();
	chatEventHandler();
	$('main-logo')?.addEventListener('click', _=>{navigate('/dashboard');})
	
	const btnLocalVsPlayer = $('btn-local-vs-player');
	btnLocalVsPlayer?.addEventListener('click', () => {
		navigate('/game?mode=local-vs-player');
	});

	const btnLocalVsAi = $('btn-local-vs-ai');
	btnLocalVsAi?.addEventListener('click', () => {
		showDifficultyModal();
	});

	const btnOnlineMatchmaking = $('btn-online-matchmaking');
	btnOnlineMatchmaking?.addEventListener('click', () => {
		navigate('/game?mode=online-matchmaking');
	});

	const btnOnlineRoom = $('btn-online-room');
	btnOnlineRoom?.addEventListener('click', () => {
		navigate('/game?mode=online-room');
	});

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
