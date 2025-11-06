import { renderRightPanel } from "./components/rightPanel";
import { renderDashboardNavBar } from "./components/NavBar";
import { navigate } from "../router";
import { renderGroupChat } from "./chat/groupChat";
import { renderProfileMenu } from "./components/profileMenu";
import { searchbar } from "./components/searchbar";
import { renderLeaderboard } from "./components/leaderboard";
import { showErrorMessage } from "./components/errorsHandler";
import { IUserData, setUserData, getUserData} from "./store"

(window as any).navigate = navigate;

export let userData: IUserData | null = getUserData();
export let response: Response  | null = null;

export async function initDashboard(isDashboard: boolean = true) {
try {
		const id = localStorage.getItem('id');
		const token = localStorage.getItem('token');
		if (!id || !token) {
			console.warn('Missing credentials');
			navigate('/login');
			return;
		}
		const response = await fetch(`http://127.0.0.1:3000/users/${id}/profile`, {
			headers: { "Authorization": `Bearer ${token}` },
		});
		if (response.status === 401 || response.status === 403) {
			localStorage.clear();
			navigate('/login');
			return;
		}
		try {
			const tmpUserData = await response.json();
			setUserData(tmpUserData);
			userData = getUserData();
		} catch (parseErr) {
			console.error('Invalid JSON from API:', parseErr);
			showErrorMessage('Unexpected server response.', 502); // to test later
			return;
		}
		renderDashboard(isDashboard);
	}	
	catch (err) {
		console.error('Network error:', err);
		showErrorMessage('Server unreachable. Try again later.', 503);
	}
}

function renderButton(nb: number) : string
{
	return `
		<div class="flex gap-2">
			<div class="bg-gradient-to-r from-color1 to-[#af4814] flex w-[130px] py-[6px] font-bold rounded-3xl
			justify-center mb-[15px] cursor-pointer transition-all duration-300 hover:scale-105">
				<img class="w-[25px] h-[25px]" src="images/populareIcon.svg" alt="">
				<button class="text-black">Game${nb}</button>
			</div>
			<img class="w-[30px] h-[30px] bg-[#D9CEAF] translate-y-[5px] 
			hover:scale-110 transition-all duration-300 rounded-full p-1" src="images/gamepadIcon.svg" alt="">
			<img class="w-[30px] h-[30px] bg-[#D9CEAF] translate-y-[5px] 
			hover:scale-110 transition-all duration-300 rounded-full p-1" src="images/instagramIcon.svg" alt="">
		</div>
	`
}

function gameOne() : string
{
	return `
		<style>
			@keyframes float {
				0%, 100% { transform: translateY(0px); }
				50% { transform: translateY(-10px); }
			}
			.float-animation {
				animation: float 3s ease-in-out infinite;
			}
			.float-animation:hover {
				animation-play-state: paused;
			}
		</style>
		<div class="float-animation bg-color4 rounded-3xl p-8 md:p-10 lg:p-12 h-[400px]
		flex flex-col md:flex-row items-center md:items-start gap-8 overflow-visible
		transition-all duration-500 transform hover:-translate-y-2 relative">
			<div class="flex-1 min-w-0 space-y-5 md:space-y-6 md:pr-8 lg:pr-12 z-10">
				${renderButton(1)}
				<h2 class="text-txtColor text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
				font-bold leading-tight tracking-tight">Pong</h2>
				<p class="text-txtColor text-sm sm:text-base lg:text-lg leading-relaxed
				opacity-90 max-w-md">Lorem ipsum, dolor sitLorem ipsum, dolor sit
				Lorem ipsum, dolor sit amet consectetur 
				adipisicing elit. Quis aspernatur velit ex modi.</p>

				<div onclick="navigate('/game')" class="inline-flex items-center gap-3 bg-gradient-to-r
				from-color1 to-[#af4814] px-6 py-3 font-bold rounded-full cursor-pointer transition-all
				duration-300 hover:scale-110 shadow-md mt-4">
					<button class="text-black text-base lg:text-lg">Play Now</button>
					<img class="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px]" src="images/playIcon.svg" alt="">
				</div>
			</div>
			<div class="flex-shrink-0 self-center md:self-start md:absolute md:right-8
			lg:right-12 md:top-[65%] md:-translate-y-1/2">
				<img class="h-auto w-full max-w-[280px] sm:max-w-[320px] md:w-[280px] lg:w-[340px] xl:w-[380px]
				md:translate-x-[40px] md:-translate-y-[95px] hover:scale-105 transition-transform duration-500
				object-contain drop-shadow-2xl" src="images/pong.png" alt="">
			</div>
		</div>
	`
}

function gameTwo() : string
{
	return `
		<div class="float-animation bg-color4 rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col h-[400px]
		md:flex-row items-center md:items-start gap-8 overflow-visible relative" style="animation-delay: 0.5s;">
			<div class="flex-1 min-w-0 space-y-5 md:space-y-6 md:pr-8 lg:pr-12 z-10">
				${renderButton(2)}
				<h2 class="text-txtColor text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight
				tracking-tight">Chess</h2>
				<p class="text-txtColor text-sm sm:text-base lg:text-lg leading-relaxed opacity-90
				max-w-md">Lorem ipsum, dolor sitLorem ipsum, dolor sit
				Lorem ipsum, dolor sit amet consectetur 
				adipisicing elit. Quis aspernatur velit ex modi.</p>
				
				<div onclick="navigate('/game')" class="inline-flex items-center gap-3 bg-gradient-to-r
				from-color1 to-[#af4814] px-6 py-3 font-bold rounded-full cursor-pointer transition-all
				duration-300 hover:scale-110 hover:shadow-lg shadow-md mt-4">
					<button class="text-black text-base lg:text-lg">Play Now</button>
					<img class="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px]" src="images/playIcon.svg" alt="">
				</div>
			</div>
			<div class="flex-shrink-0 self-center md:self-start md:absolute md:right-8 lg:right-12 md:top-1/2 md:-translate-y-1/2">
				<img class="h-auto w-full max-w-[280px] sm:max-w-[320px] md:w-[280px] lg:w-[340px] xl:w-[380px] md:translate-x-[40px]
				md:-translate-y-[95px] hover:scale-105 transition-transform duration-500
				object-contain drop-shadow-2xl" src="images/chess.png" alt="">
			</div>
		</div>
	`
}

function renderWelcome() : string
{
	return `
		<div class="rounded-3xl grid grid-cols-1 xl:grid-cols-2 gap-6">
			${gameOne()}
			${gameTwo()}
		</div>
	`
}

function slidingLogic()
{
	const slider = document.getElementById('slider');
	const nextBtn = document.getElementById('next');
	const prevBtn = document.getElementById('prev');
	
	if (!slider || !nextBtn || !prevBtn) return;
	
	let currentIndex = 0;
	const cards = slider.querySelectorAll('div');
	const totalCards = cards.length;
	
	const getCardWidth = () => {
		const card = cards[0];
		if (!card) return 0;
		return card.offsetWidth + 40;
	};
	
	const getMaxIndex = () => {
		const containerWidth = slider.parentElement?.offsetWidth || 0;
		const cardWidth = getCardWidth();
		if (cardWidth === 0) return 0;
		const visibleCards = Math.floor(containerWidth / cardWidth);
		return Math.max(0, totalCards - visibleCards);
	};
	
	const updateSlider = () => {
		const cardWidth = getCardWidth();
		slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
	};
	
	nextBtn.addEventListener('click', () => {
		const maxIndex = getMaxIndex();
		currentIndex++;
		if (currentIndex > maxIndex) {
			currentIndex = 0;
		}
		updateSlider();
	});

	prevBtn.addEventListener('click', () => {
		const maxIndex = getMaxIndex();
		currentIndex--;
		if (currentIndex < 0) {
			currentIndex = maxIndex;
		}
		updateSlider();
	});
	
	let resizeTimeout: number;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(() => {
			const maxIndex = getMaxIndex();
			if (currentIndex > maxIndex) {
				currentIndex = maxIndex;
			}
			updateSlider();
		}, 150);
	});
}

function renderStatistics(): string {
	return `
		<div class="statistics mb-6">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Your Statistic</h2>
			<div class="bg-color4 rounded-3xl text-txtColor grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
				<div class="bg-[#1b1a1d] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Total Wins</p>
					<p class="text-4xl font-bold text-txtColor">127</p>
					<p class="text-sm text-color15">+12 this week</p>
				</div>
				<div class="bg-[#1b1a1d] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Win Rate</p>
					<p class="text-4xl font-bold text-txtColor">74.7%</p>
					<p class="text-sm text-blue-600">Above average</p>
				</div>
				<div class="bg-[#1b1a1d] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
					<p class="text-sm">Current Streak</p>
					<p class="text-4xl font-bold text-txtColor">8</p>
					<p class="text-sm text-orange-400">Personal best!</p>
				</div>
				<div class="bg-[#1b1a1d] transition-all duration-500 hover:bg-[#ed6f3033] rounded-2xl p-6">
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
		<div class="w-full md:w-[47%]">
			${renderLeaderboard()}
			${renderStatistics()}
		</div>
	`;
}

function renderDashboardContent(): string {
	return `
		<div class="flex gap-6 mt-6" >
			${renderAnalyticsSection()}
			${renderGroupChat()}
		</div>
	`;
}


function renderMain() : string
{
	return `
		<div class="w-full">
			<h2 class="font-bold mb-[20px] text-[#414658] text-2xl">Welcome back,
			<span class="text-txtColor text-3xl"> ${userData?.username}</span></h2>
			<div class="flex w-full gap-6">
				<div class="flex-1">${renderWelcome()}</div>
				<div class="flex-[0.01]">${renderRightPanel()}</div>
			</div>
			${renderDashboardContent()}
		</div>
	`
}

export function renderDashboard(isDashboard: boolean = true)
{
	document.body.innerHTML = `
		<div class=" bg-bgColor min-h-screen">
			${renderDashboardNavBar(userData, userData!.profileImage)}
			<main id="dashboard-content" class="flex sm:w-[95%] w-[99%] m-auto">
				${isDashboard ? renderMain() : ''}
			</main>
		</div>
	`;
	document.getElementById('main-logo')?.addEventListener('click', _=>{navigate('/dashboard');})
	if (isDashboard)
		slidingLogic();
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
