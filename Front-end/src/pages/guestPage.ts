import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { AliasPopUp } from "./home"
import { showDifficultyModal } from "./components/difficultyModal"

const $ = (id : string) => document.getElementById(id as string);
export async function renderGuest()
{
    document.body.innerHTML = /* html */`
		<div id="app" class="flex-grow w-full mx-auto min-h-screen relative overflow-hidden">
			<div class="absolute inset-0 bg-black opacity-70 blur-3xl z-[-1]"></div>
			<video class="fixed w-full h-full object-cover -z-10"
			loop
			autoplay
			muted
			playsinline
			disablepictureinpicture
			tabindex="-1"
			aria-hidden="true"
			style="pointer-events: none;"
			>
			<source src="images/bg.webm" type="video/webm">
			Your browser does not support the video tag.
			</video>
			<div class="content mx-auto w-[90%]">
				${renderNavBar(false)}
				<div class="mt-16 mb-12 text-center px-4">
					<h1 class="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-color1 via-color2 to-color1 bg-clip-text text-transparent">
						Play as Guest
					</h1>
					<p class="text-txtColor/70 text-xl md:text-2xl font-light tracking-wide">
						Choose your game mode and start playing instantly
					</p>
				</div>
				<div id="guest-content" class="max-w-7xl mx-auto px-4 pb-20">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
						<button id="vs-ai-btn" class="group relative bg-gradient-to-br from-bgColor/90 to-black/80
							backdrop-blur-xl p-8 rounded-3xl border-2 border-color1/30 
							hover:border-color1 transition-all duration-500 
							hover:scale-105 glow-effect
							overflow-hidden">
							<div class="absolute inset-0 bg-gradient-to-br from-color1/0 via-color1/5 to-color1/20 
								opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div class="relative z-10">
								<div class="mb-6 text-6xl flex justify-center">🤖</div>
								<h3 class="text-4xl lg:text-5xl font-bold text-color1 mb-4 group-hover:scale-110 transition-transform duration-300">
									Vs AI
								</h3>
								<p class="text-txtColor/60 text-lg mb-6">
									Test your skills against our intelligent AI opponent
								</p>
								<div class="flex items-center justify-center gap-2 text-color1 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
									<span>Play Now</span>
									<svg class="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
									</svg>
								</div>
							</div>
						</button>

						<button id="vs-player-btn" class="group relative bg-gradient-to-br from-bgColor/90 to-black/80 
							backdrop-blur-xl p-8 rounded-3xl border-2 border-color2/30 
							hover:border-color2 transition-all duration-500 
							hover:scale-105 
							overflow-hidden"
							style="box-shadow: 0 0 20px rgba(209, 138, 16, 0.1);">
							<div class="absolute inset-0 bg-gradient-to-br from-color2/0 via-color2/5 to-color2/20 
								opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div class="relative z-10">
								<div class="mb-6 text-6xl flex justify-center">⚔️</div>
								<h3 class="text-4xl lg:text-5xl font-bold text-color2 mb-4 group-hover:scale-110 transition-transform duration-300">
									Vs Player
								</h3>
								<p class="text-txtColor/60 text-lg mb-6">
									Challenge a friend in an epic 1v1 battle
								</p>
								<div class="flex items-center justify-center gap-2 text-color2 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
									<span>Play Now</span>
									<svg class="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
									</svg>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	`
	$("go-as-guest")!.textContent = sessionStorage.getItem("guest");
    $('go-as-guest')!.addEventListener('click',_ => {
		AliasPopUp(true, "guest");
	})
    $('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	$('go-sign-in')!.addEventListener('click',_ => {navigate("/login")})
	$('go-sign-up')!.addEventListener('click',_ => {navigate("/sign-up")})
	$('go-as-guest')!.addEventListener('click',_ => {navigate("/guest")})
	
	$('vs-ai-btn')?.addEventListener('click', _ => {
		showDifficultyModal();
	});
	$('vs-player-btn')?.addEventListener('click', _ => {
		console.log('VS Player mode selected');
	});
}