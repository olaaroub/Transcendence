import { notifications, renderDashboardNavBar } from "./components/NavBar";
import { navigate } from "../router";
import { renderGlobalChat } from "./chat/globalChat";
import { renderProfileMenu } from "./components/profileMenu";
import { searchbar } from "./components/searchbar";
import { dashboardLearderboard } from "./components/leaderboard";
import { apiFetch, showErrorMessage } from "./components/errorsHandler";
import { setUserData, userData, getImageUrl, credentials, IUserData, setCredentials} from "./store"
import { chatEventHandler, cleanupPrivateChat, initGlobalChatNotifications, initUnreadFromStorage } from "./chat/chat";
import { showDifficultyModal } from "./components/difficultyModal";
import { AliasPopUp } from "./home";
import { toastInfo } from "./components/toast";
import { shortString } from "./utils"

const $ = (id : string) => document.getElementById(id as string);

interface IUserStatistics {
	TotalWins: number;
	WinRate: number;
	CurrentStreak: number;
	Rating: number;
}

export let response: Response  | null = null;

export async function fetchUserStatistics(userId: string | number | null): Promise<IUserStatistics | null> {
	if (!userId) {
		console.warn('User ID is null or undefined');
		return null;
	}
	const { data, error } = await apiFetch<IUserStatistics>(`/api/user/statistic/${userId}`, {
		showErrorToast: false
	});
	if (error) {
		if (error.isNetworkError)
			showErrorMessage('Server unreachable. Try again later.', 503);
		return null;
	}
	return data;
}

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
	cleanupPrivateChat();
	const profileResponse = await fetchProfile(credentials.id);
	if (!profileResponse) {
		localStorage.clear();
		navigate('/login');
		return;
	}
	initGlobalChatNotifications();
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
					<img src="images/${icon}" class="w-10 h-10 text-${colorClass}">
				</div>
				<span class="text-white font-Oi font-bold group-hover:text-${colorClass} transition-colors duration-200">${title}</span>
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
			icon: 'vsplayer.svg',
			title: '1v1 Player',
			description: 'Challenge a friend locally'
		},
		{
			id: 'btn-local-vs-ai',
			colorClass: 'color2',
			icon: 'vsai.svg',
			title: 'Vs AI',
			description: 'Test your skills against AI'
		}
	];

	return /* html */ `
		<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] glow-effect rounded-2xl p-6
		transition-all duration-300 border border-white/5">
			<div class="flex items-center gap-3 mb-6">
				<h3 class="text-white text-3xl font-Oi font-bold">Local Pong</h3>
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
			icon: 'matchmaking.svg',
			title: 'Matchmaking',
			description: 'Find a ranked opponent'
		},
		{
			id: 'btn-online-spectate',
			colorClass: 'color2',
			icon: 'spectate.svg',
			title: 'Spectate a Game',
			description: 'Watch a live match'
		}
	];

	return /* html */ `
		<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] glow-effect rounded-2xl p-6
		transition-all duration-300 border border-white/5">
			<div class="flex items-center gap-3 mb-6">
				<h3 class="text-white text-3xl font-Oi font-bold">Online Pong</h3>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				${onlineModes.map(mode => renderGameModeButton(mode.id, mode.colorClass, mode.icon, mode.title, mode.description)).join('')}
			</div>
		</div>
	`
}

function renderStatistics(stats: IUserStatistics | null): string {
	const totalWins = stats?.TotalWins ?? 0;
	const winRate = stats?.WinRate ?? 0;
	const currentStreak = stats?.CurrentStreak ?? 0;
	const rating = stats?.Rating ?? 0;
	const winRateStatus = winRate >= 50 ? 'Above average' : 'Below average';
	const winRateColor = winRate >= 50 ? 'text-blue-600' : 'text-red-400';
	const streakStatus = currentStreak >= 5 ? 'Personal best!' : currentStreak >= 3 ? 'On fire!' : '';
	const streakColor = currentStreak >= 5 ? 'text-orange-400' : 'text-yellow-400';
	const getRank = (rating: number): { name: string; color: string } => {
		if (rating >= 3000) return { name: 'Grandmaster', color: 'text-red-500' };
		if (rating >= 2800) return { name: 'Master', color: 'text-purple-500' };
		if (rating >= 2500) return { name: 'Diamond III', color: 'text-[#8261BE]' };
		if (rating >= 2200) return { name: 'Diamond II', color: 'text-[#8261BE]' };
		if (rating >= 2000) return { name: 'Diamond I', color: 'text-[#8261BE]' };
		if (rating >= 1800) return { name: 'Platinum', color: 'text-cyan-400' };
		if (rating >= 1600) return { name: 'Gold', color: 'text-yellow-500' };
		if (rating >= 1400) return { name: 'Silver', color: 'text-gray-400' };
		return { name: 'Bronze', color: 'text-orange-700' };
	};
	const rank = getRank(rating);

	return /* html */ `
		<div class="statistics mb-6">
			<h2 class="text-txtColor font-bold text-xl sm:text-2xl mb-3 sm:mb-4 transition-all duration">Your Statistics</h2>
			<div class="bg-color4 hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 glow-effect rounded-2xl sm:rounded-3xl
			text-txtColor grid grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Total Wins</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">${totalWins}</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Win Rate</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">${Math.floor(winRate)}%</p>
					<p class="text-xs sm:text-sm ${winRateColor} mt-1">${winRateStatus}</p>
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Current Streak</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">${currentStreak}</p>
					${streakStatus ? `<p class="text-xs sm:text-sm ${streakColor} mt-1">${streakStatus}</p>` : ''}
				</div>
				<div class="bg-[rgb(27_26_29_/_75%)] transition-all duration-500 hover:bg-[#ed6f3033] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
					<p class="text-xs sm:text-sm text-gray-400">Rating</p>
					<p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-txtColor mt-1">${rating}</p>
					<p class="text-xs sm:text-sm ${rank.color} mt-1">${rank.name}</p>
				</div>
			</div>
		</div>
	`;
}

function renderDashboardContent(stats: IUserStatistics | null): string {
	return /* html */`
		<div class="flex flex-col md:flex-row gap-6 mt-6 w-full" >
			<div class="w-full md:w-[50%] h-[580px] flex flex-col justify-between">
				<div id="dashboard-leaderboard"></div>
				${renderStatistics(stats)}
			</div>
			${renderGlobalChat()}
		</div>
	`;
}

async function renderMain() : Promise<string>
{
	const stats = await fetchUserStatistics(credentials.id);
	return /* html */`
		<div class="w-full">
			<h2 class="font-bold mb-[20px] text-[#414658] font-Oi text-3xl">Welcome back,
			<span class="text-txtColor text-3xl"> ${shortString(userData.username, 10)}</span></h2>
			<div class="flex-1">
				<div class="rounded-3xl grid grid-cols-1 xl:grid-cols-2 gap-6">
					${LocalPong()}
					${OnlinePong()}
				</div>
			</div>
			${renderDashboardContent(stats)}
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
		if (leaderboardContainer)
			leaderboardContainer.innerHTML = await dashboardLearderboard();
	}
	$('see-more')?.addEventListener('click', _=>{navigate('/leaderboard');})
	notifications();
	chatEventHandler();
	initUnreadFromStorage();
	$('main-logo')?.addEventListener('click', _=>{navigate('/dashboard');});
	$('btn-local-vs-player')?.addEventListener('click', () => {AliasPopUp("player2");});
	$('btn-local-vs-ai')?.addEventListener('click', () => {showDifficultyModal();});

	interface RoomData
	{
		roomId:			string;
		PlayerID:		string;
		playerName: 	string | null;
		playerAvatar:	string | null;
	}

	const btnOnlineMatchmaking = $('btn-online-matchmaking');
	btnOnlineMatchmaking?.addEventListener('click', async () => {
		const { data, error} = await apiFetch<{roomId : string}>("/api/game/matchmaking");
		if (error || !data) return;
		const roomData : RoomData = {
			roomId : data.roomId,
			PlayerID: String(userData.id),
			playerName: userData.username,
			playerAvatar: getImageUrl(userData.avatar_url)
		};
		sessionStorage.setItem("room", JSON.stringify(roomData));
		navigate(`/pong-game?mode=online-matchmaking`);
	});

	const btnOnlineSpectate = $('btn-online-spectate');
	btnOnlineSpectate?.addEventListener('click', async () => {
		const { data, error} = await apiFetch<{roomId: string | null}>("/api/game/spectate");
		if (error || !data) return;
		if (!data.roomId)
		{
			toastInfo("No available games to spectate. Please try again later.");
			return;
		}
		const roomData : RoomData = {
			roomId : data.roomId,
			PlayerID: String(userData.id),
			playerName: userData.username,
			playerAvatar: getImageUrl(userData.avatar_url)
		};
		sessionStorage.setItem("room", JSON.stringify(roomData));
		navigate('/pong-game');
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
