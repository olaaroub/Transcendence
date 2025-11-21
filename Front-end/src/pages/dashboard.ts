import { renderRightPanel } from "./components/rightPanel";
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
		<div class="bg-color4 rounded-3xl p-6 flex flex-col h-[400px]
		items-center md:items-start gap-8 overflow-visible relative" style="animation-delay: 0.5s;">
			<div class="flex gap-6 items-center">
				<img class="h-[60px]" src="images/localRemote.svg">
				<p class="text-color1 text-[50px] font-[900]" style="font-family: 'Pixelify Sans', sans-serif;">Local Pong</p>
			</div>
			<div class="flex w-[65%] h-full gap-3">
				<div class="w-full flex flex-col h-[250px] gap-3 flex-1">
					<button class="hover:to-[#2a2a38] rounded-2xl w-full h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-[#3a3a4e] relative overflow-hidden group">
					<div class="absolute inset-0 bg-gradient-to-r from-color1/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<img class="w-full h-full" src="images/online.webp"></img>
					</button>
					<button class="bg-[url('images/vsAI.webp')] bg-cover bg-center hover:from-[#3a3a4e] hover:to-[#2a2a38] rounded-2xl w-full h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-[#3a3a4e] relative overflow-hidden group">
						<div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						<img class="w-full h-full" src="images/online.webp"></img>
					</button>
				</div>
				${gameButtons('images/online.webp')}
			</div>
			<div class="flex-shrink-0 self-center md:self-start md:absolute md:right-8
			lg:right-12 md:top-[65%] md:-translate-y-1/2">
				<img class="h-auto w-full max-w-[280px] sm:max-w-[320px] md:w-[280px] lg:w-[340px] xl:w-[380px]
				md:translate-x-[40px] md:-translate-y-[95px]
				object-contain drop-shadow-2xl" src="images/pong.png" alt="">
			</div>
		</div>
	`
}

function gameButtons(bg:string)
{
	return `
		<button class=" hover:from-[#3a3a4e] flex-1 hover:to-[#2a2a38] rounded-2xl transition-all h-[250px]
		duration-300 hover:scale-105 hover:shadow-2xl border-2 border-[#3a3a4e] relative overflow-hidden group">
			<div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<img class="w-full h-full" src="images/online.webp"></img>
		</button>
	`
}

function OnlinePong() : string
{
	return `
		<div class="bg-color4 rounded-3xl p-6 flex flex-col h-[400px]
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
				<img class="h-auto w-full max-w-[280px] sm:max-w-[320px] md:w-[280px] lg:w-[340px] xl:w-[380px]
				md:translate-x-[40px] md:-translate-y-[95px]
				object-contain drop-shadow-2xl" src="images/pongOnline.webp" alt="">
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
		<div class="w-full md:w-[50%]">
			${renderLeaderboard()}
			${renderStatistics()}
		</div>
	`;
}

function renderFriends()
{
	return `
		<div class="w-full md:w-[20%] bg-color4 rounded-2xl pt-3">
			<h2 class="text-txtColor font-bold text-2xl mb-4 text-center">Friends</h2>
			<div class="bg-color4 py-6 px-6 rounded-3xl h-[509px]">

			</div>
		</div>
	`
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
		<div class=" bg-bgColor min-h-screen">
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
