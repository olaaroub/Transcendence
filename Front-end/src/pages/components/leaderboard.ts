import { initDashboard } from "../dashboard";
import { getImageUrl } from "../store";
import { shortString } from "../utils";
import { apiFetch } from "./errorsHandler";
import { navigate } from "../../router";

const $ = (id: string) => document.getElementById(id as string)

interface LeaderboardPlayer {
	id: number;
	username: string;
	avatar_url: string;
	Rating: number;
	GamesPlayed: number;
	TotalWins: number;
	TotalLosses: number;
	WinRate: number;
}

let leaderboardData: LeaderboardPlayer[] = [];

async function fetchLeaderboard(start: number = 0, offset: number = 10): Promise<LeaderboardPlayer[]> {
	const { data, error } = await apiFetch<LeaderboardPlayer[]>(
		`/api/user/leaderboard?start=${start}&offset=${offset}`,
		{ showErrorToast: false }
	);
	if (error || !data) {
		console.error('Failed to fetch leaderboard:', error?.message);
		return [];
	}
	return data;
}

export async function dashboardLearderboard(): Promise<string> {
	const topPlayers = await fetchLeaderboard(0, 3);

	if (!topPlayers || topPlayers.length === 0) {
		return /* html */ `
			<div class="w-full">
				<h2 class="text-txtColor font-bold text-2xl mb-4">Leaderboard</h2>
				<div class="rounded-3xl text-txtColor relative flex flex-col gap-6">
					<p class="text-gray-400 text-center py-8">No leaderboard data available</p>
					<button id="see-more" class="absolute bottom-[-20px] left-1/2 -translate-x-1/2 rounded-3xl
					bg-[rgb(27_26_29_/_75%)] hover:bg-[#ed6f3033] px-4 py-2 z-10">see more</button>
				</div>
			</div>
		`;
	}
	return /* html */ `
		<div class="w-full">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Leaderboard</h2>
			<div class="rounded-3xl text-txtColor relative flex flex-col gap-6">
				<button id="see-more" class="absolute bottom-[-20px] left-1/2 -translate-x-1/2 rounded-3xl
				bg-[rgb(27_26_29_/_75%)] hover:bg-[#ed6f3033] px-4 py-2 z-10">see more</button>
				${topPlayers.map((player, index) => `
					<div class="bg-color4 glow-effect w-full rounded-2xl flex gap-3 items-center relative hover:scale-[1.02]
					hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 border-x-4 border-color2">
						${index === 0 ? '<img class="absolute -top-5 -left-7 -rotate-[50deg]" src="images/king.svg">' : ''}
						<img class="rounded-full w-[70px] h-[70px] object-cover" src="${getImageUrl(player.avatar_url)}">
						<span class="font-bold text-lg text-txtColor">${shortString(player.username, 14)}</span>
						<span class="ml-auto mr-4 bg-color1/20 px-3 py-1 rounded-full border border-color1/40 text-color1 font-bold">${player.Rating}</span>
					</div>
				`).join('')}
			</div>
		</div>
	`;
}

function renderPodiumPlayer(player: LeaderboardPlayer, rank: number): string {
	const configs: Record<number, {
		size: string, border: string, badge: string, gradient: string, 
		minH: string, hoverMinH: string, textSize: string, ratingSize: string, mt: string
	}> = {
		1: { size: 'w-24 h-24', border: 'border-color1', badge: '👑', gradient: 'from-color1/30 to-color2/20', minH: 'min-h-[128px]', hoverMinH: 'group-hover:min-h-[180px]', textSize: 'text-xl', ratingSize: 'text-2xl', mt: '-mt-6' },
		2: { size: 'w-20 h-20', border: 'border-gray-400', badge: '🥈', gradient: 'from-gray-400/20 to-gray-500/10', minH: 'min-h-[96px]', hoverMinH: 'group-hover:min-h-[140px]', textSize: 'text-lg', ratingSize: 'text-xl', mt: '' },
		3: { size: 'w-20 h-20', border: 'border-amber-600', badge: '🥉', gradient: 'from-amber-600/20 to-amber-700/10', minH: 'min-h-[80px]', hoverMinH: 'group-hover:min-h-[124px]', textSize: 'text-lg', ratingSize: 'text-xl', mt: '' }
	};
	const cfg = configs[rank];
	
	return /* html */ `
		<div id="podium-${rank}" data-player-id="${player.id}" class="group flex flex-col items-center ${cfg.mt} cursor-pointer transition-all duration-500 hover:-translate-y-2">
			<div class="relative mb-3">
				<img src="${getImageUrl(player.avatar_url)}" 
					class="${cfg.size} rounded-full border-4 ${cfg.border} object-cover shadow-lg">
				<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${cfg.gradient} rounded-full flex items-center justify-center shadow-lg">
					<span class="text-white font-black text-sm">${cfg.badge}</span>
				</div>
			</div>
			<div class="bg-gradient-to-b ${cfg.gradient} rounded-t-2xl p-4 w-32 ${cfg.minH} transition-all duration-500 ${cfg.hoverMinH} flex flex-col items-center justify-center border-t-4 ${cfg.border} overflow-hidden">
				<span class="text-txtColor font-bold ${cfg.textSize}">${shortString(player.username, 6)}</span>
				<span class="text-color1 font-black ${cfg.ratingSize} mb-2">${player.Rating}</span>
				<div class="max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-1 text-xs">
					<span class="text-gray-300"><span class="text-green-400 font-semibold">${player.TotalWins}W</span> / <span class="text-red-400 font-semibold">${player.TotalLosses}L</span></span>
					<span class="text-gray-400">${Math.floor(player.WinRate)}% Win Rate</span>
				</div>
			</div>
		</div>
	`;
}

function renderPlayerRow(player: LeaderboardPlayer, rank: number): string {
	return /* html */ `
		<div data-player-id="${player.id}" class="grid grid-cols-6 gap-4 items-center p-4 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300 cursor-pointer
			${rank <= 3 ? 'border-l-4' : 'border-l-2'} 
			${rank === 1 ? 'border-color1 bg-color1/5' : rank === 2 ? 'border-gray-400' : rank === 3 ? 'border-amber-600' : 'border-color3'}">
			<div class="col-span-2 flex items-center gap-3">
				<span class="text-txtColor font-black text-lg min-w-[2rem] ${rank <= 3 ? 'text-color1' : ''}">#${rank}</span>
				<img src="${getImageUrl(player.avatar_url)}" 
					class="w-12 h-12 rounded-full object-cover border-2 ${rank === 1 ? 'border-color1' : 'border-color3'}">
				<span class="text-txtColor font-bold text-base">${shortString(player.username, 14)}</span>
			</div>
			<div class="text-center text-txtColor font-semibold">${player.GamesPlayed}</div>
			<div class="text-center">
				<div class="inline-flex items-center gap-2">
					<div class="w-16 bg-gray-700 rounded-full h-2 overflow-hidden">
						<div class="bg-color1 h-full rounded-full transition-all duration-300" style="width: ${Math.floor(player.WinRate)}%"></div>
					</div>
					<span class="text-color1 font-bold text-sm">${Math.floor(player.WinRate)}%</span>
				</div>
			</div>
			<div class="text-center">
				<span class="text-green-400 font-bold text-sm">${player.TotalWins}</span>
				<span class="text-gray-500 mx-1">/</span>
				<span class="text-red-400 font-bold text-sm">${player.TotalLosses}</span>
			</div>
			<div class="text-center">
				<span class="bg-color1/20 px-3 py-1 rounded-full border border-color1/40 text-color1 font-bold inline-block">
					${player.Rating}
				</span>
			</div>
		</div>
	`;
}

export async function renderLeaderboard() {
	await initDashboard(false);
	leaderboardData = await fetchLeaderboard(0, 20);
	const dashContent = $('dashboard-content');
	if (!dashContent) return;
	
	if (!leaderboardData || leaderboardData.length === 0) {
		dashContent.innerHTML = /* html */ `
			<div class="w-full h-full flex items-center justify-center">
				<p class="text-gray-400 text-xl">No leaderboard data available</p>
			</div>
		`;
		return;
	}

	const top3 = leaderboardData.slice(0, 3);

	dashContent.innerHTML = /* html */ `
		<div class="w-full h-full flex flex-col gap-6 p-6">
			<div class="flex items-end justify-center gap-6 mb-6 min-h-[280px]">
				${top3[1] ? renderPodiumPlayer(top3[1], 2) : ''}
				${top3[0] ? renderPodiumPlayer(top3[0], 1) : ''}
				${top3[2] ? renderPodiumPlayer(top3[2], 3) : ''}
			</div>
			<div id="player-details" class="hidden"></div>
			<div class="bg-color4 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
				<div class="grid grid-cols-6 gap-4 text-gray-400 text-sm font-bold mb-4 pb-3 border-b border-color3">
					<div class="col-span-2">PLAYER</div>
					<div class="text-center">GAMES</div>
					<div class="text-center">WIN RATE</div>
					<div class="text-center">W/L</div>
					<div class="text-center">RATING</div>
				</div>
				<div class="overflow-y-auto scrollbar-custom pr-2 flex flex-col gap-2">
					${leaderboardData.map((player, index) => renderPlayerRow(player, index + 1)).join('')}
				</div>
			</div>
		</div>
	`;

	dashContent.querySelectorAll('[data-player-id]').forEach(el => {
		el.addEventListener('click', () => {
			const playerId = el.getAttribute('data-player-id');
			if (playerId) navigate(`/profile/${playerId}`);
		});
	});
}