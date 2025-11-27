import { mockMessages } from "../chat/mockMessages";
import { initDashboard } from "../dashboard";
import { getImageUrl } from "../store";

interface LeaderboardPlayer {
	rank: number;
	username: string;
	avatar: string;
	wins: number;
	losses: number;
	winRate: number;
	points: number;
	gamesPlayed: number;
}

const fullLeaderboardData: LeaderboardPlayer[] = [
	{ rank: 1, username: 'mmondad', avatar: 'images/mmondad.jpeg', wins: 48, losses: 12, winRate: 80, points: 2450, gamesPlayed: 60 },
	{ rank: 2, username: 'Ohammou-', avatar: 'images/ohammou-.jpeg', wins: 42, losses: 18, winRate: 70, points: 2200, gamesPlayed: 60 },
	{ rank: 3, username: 'hes-safi', avatar: 'images/hes-safi.jpeg', wins: 38, losses: 22, winRate: 63, points: 2050, gamesPlayed: 60 },
	{ rank: 4, username: 'oumondad', avatar: 'images/oumondad.jpeg', wins: 35, losses: 25, winRate: 58, points: 1900, gamesPlayed: 60 },
	{ rank: 5, username: 'olaaroub', avatar: 'images/olaaroub.jpeg', wins: 32, losses: 28, winRate: 53, points: 1750, gamesPlayed: 60 },
	{ rank: 6, username: 'player6', avatar: 'images/mmondad.jpeg', wins: 28, losses: 32, winRate: 47, points: 1600, gamesPlayed: 60 },
	{ rank: 7, username: 'player7', avatar: 'images/ohammou-.jpeg', wins: 25, losses: 35, winRate: 42, points: 1450, gamesPlayed: 60 },
	{ rank: 8, username: 'player8', avatar: 'images/hes-safi.jpeg', wins: 22, losses: 38, winRate: 37, points: 1300, gamesPlayed: 60 },
	{ rank: 9, username: 'player9', avatar: 'images/oumondad.jpeg', wins: 20, losses: 40, winRate: 33, points: 1200, gamesPlayed: 60 },
	{ rank: 10, username: 'player10', avatar: 'images/olaaroub.jpeg', wins: 18, losses: 42, winRate: 30, points: 1100, gamesPlayed: 60 },
];

export function dashboardLearderboard(): string {
	return `
		<div class="w-full">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Leaderboard</h2>
			<div class="rounded-3xl text-txtColor relative flex flex-col  gap-6">
				<button id="see-more" class="absolute bottom-[-20px] left-1/2 -translate-x-1/2 rounded-3xl
				bg-[rgb(27_26_29_/_75%)] hover:bg-[#ed6f3033] px-4 py-2 z-10">see more</button>
				${mockMessages.map((msg, index) => `
				${index < 3 ? `
					<div class="bg-color4 glow-effect w-full rounded-2xl flex gap-3 items-center relative hover:scale-[1.02]
					hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 border-x-4 border-color2">
						${index == 0 ? '<img  class="absolute -top-5 -left-7 -rotate-[50deg]" src="images/king.svg">' : ''}
						<img class="rounded-full w-[70px] h-[70px]" src="${msg.avatar}">
						<span class="font-bold text-lg text-txtColor">${msg.senderName}</span>
					</div>	
					` : ''}
				`).join('')}
			</div>
		</div>
	`;
}

export async function renderLeaderboard() {
	await initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = `
		<div class="w-full h-full flex flex-col gap-6 p-6">
			<div class="flex items-end justify-center gap-6 mb-6">
				<div class="flex flex-col items-center">
					<div class="relative mb-3">
						<img src="${getImageUrl(fullLeaderboardData[1].avatar)}" 
							class="w-20 h-20 rounded-full border-4 border-gray-400 object-cover shadow-lg">
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
							<span class="text-white font-black text-sm">🥈</span>
						</div>
					</div>
					<div class="bg-gradient-to-b from-gray-400/20 to-gray-500/10 rounded-t-2xl p-4 w-32 h-24 flex flex-col items-center justify-center border-t-4 border-gray-400">
						<span class="text-txtColor font-bold text-lg">${fullLeaderboardData[1].username}</span>
						<span class="text-color1 font-black text-xl">${fullLeaderboardData[1].points}</span>
					</div>
				</div>

				<div class="flex flex-col items-center -mt-6">
					<div class="relative mb-3">
						<img src="${getImageUrl(fullLeaderboardData[0].avatar)}" 
							class="w-24 h-24 rounded-full border-4 border-color1 object-cover shadow-2xl">
						<div class="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
							<span class="text-white font-black text-lg">👑</span>
						</div>
					</div>
					<div class="bg-gradient-to-b from-color1/30 to-color2/20 rounded-t-2xl p-4 w-36 h-32 flex flex-col items-center justify-center border-t-4 border-color1">
						<span class="text-txtColor font-bold text-xl">${fullLeaderboardData[0].username}</span>
						<span class="text-color1 font-black text-2xl">${fullLeaderboardData[0].points}</span>
					</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="relative mb-3">
						<img src="${getImageUrl(fullLeaderboardData[2].avatar)}" 
							class="w-20 h-20 rounded-full border-4 border-amber-600 object-cover shadow-lg">
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
							<span class="text-white font-black text-sm">🥉</span>
						</div>
					</div>
					<div class="bg-gradient-to-b from-amber-600/20 to-amber-700/10 rounded-t-2xl p-4 w-32 h-20 flex flex-col items-center justify-center border-t-4 border-amber-600">
						<span class="text-txtColor font-bold text-lg">${fullLeaderboardData[2].username}</span>
						<span class="text-color1 font-black text-xl">${fullLeaderboardData[2].points}</span>
					</div>
				</div>
			</div>

			<div class="bg-color4 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
				<div class="grid grid-cols-6 gap-4 text-gray-400 text-sm font-bold mb-4 pb-3 border-b border-color3">
					<div class="col-span-2">PLAYER</div>
					<div class="text-center">GAMES</div>
					<div class="text-center">WIN RATE</div>
					<div class="text-center">W/L</div>
					<div class="text-center">POINTS</div>
				</div>
				
				<div class="overflow-y-auto scrollbar-custom pr-2 flex flex-col gap-2">
					${fullLeaderboardData.map((player) => `
						<div class="grid grid-cols-6 gap-4 items-center p-4 rounded-xl bg-black/30 hover:bg-black/50 transition-all cursor-pointer
							${player.rank <= 3 ? 'border-l-4' : 'border-l-2'} 
							${player.rank === 1 ? 'border-color1 bg-color1/5' : player.rank === 2 ? 'border-gray-400' : player.rank === 3 ? 'border-amber-600' : 'border-color3'}">
							
							<div class="col-span-2 flex items-center gap-3">
								<span class="text-txtColor font-black text-lg min-w-[2rem] ${player.rank <= 3 ? 'text-color1' : ''}">#${player.rank}</span>
								<img src="${getImageUrl(player.avatar)}" 
									class="w-12 h-12 rounded-full object-cover border-2 ${player.rank === 1 ? 'border-color1' : 'border-color3'}">
								<span class="text-txtColor font-bold text-base">${player.username}</span>
							</div>
							
							<div class="text-center text-txtColor font-semibold">${player.gamesPlayed}</div>
							
							<div class="text-center">
								<div class="inline-flex items-center gap-2">
									<div class="w-16 bg-gray-700 rounded-full h-2 overflow-hidden">
										<div class="bg-color1 h-full rounded-full" style="width: ${player.winRate}%"></div>
									</div>
									<span class="text-color1 font-bold text-sm">${player.winRate}%</span>
								</div>
							</div>
							
							<div class="text-center">
								<span class="text-green-400 font-bold text-sm">${player.wins}</span>
								<span class="text-gray-500 mx-1">/</span>
								<span class="text-red-400 font-bold text-sm">${player.losses}</span>
							</div>
							
							<div class="text-center">
								<span class="bg-color1/20 px-3 py-1 rounded-full border border-color1/40 text-color1 font-bold inline-block">
									${player.points}
								</span>
							</div>
						</div>
					`).join('')}
				</div>
			</div>
		</div>
		`;
}