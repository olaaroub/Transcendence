import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { userData } from "./store";

const $ = (id: string) => document.getElementById(id as string)

// export function renderHomeText (isLoged: boolean)
// {
//     return /* html */ `
// 		<div class="data flex flex-col sm:flex-row items-center justify-center sm:justify-between min-h-[calc(100vh-200px)]
// 		gap-4 xs:gap-5 sm:gap-8 md:gap-10 xl:gap-12 2xl:gap-16 px-3 xs:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-0">
// 			<div class="txt w-full sm:w-1/2 text-center sm:text-left transition-all duration-500 ${isLoged ? 'opacity-0' : ''}">
// 				<h1
// 					class="text-[28px] xs:text-[36px] sm:text-[50px] md:text-[70px] lg:text-[90px] xl:text-[120px] 2xl:text-[135px]
// 					font-bold text-txtColor glow-stroke leading-[1.1] mb-3 xs:mb-4 sm:mb-6 xl:mb-8">
// 					Let's play<br/>Together...
// 				</h1>
// 				<p
// 					class="text-[#878787] max-w-full mx-auto sm:mx-0
// 					sm:max-w-[431px] xl:max-w-[500px] text-[14px] xs:text-[15px] sm:text-[17px]
// 					md:text-[19px] xl:text-[22px] leading-[1.5] xs:leading-[1.6] sm:leading-[1.7] xl:leading-[1.75] px-2 sm:px-0">
// 						Welcome to SPACE PONG, where you can experience the legendary original Pong game in all its glory.
// 						<br class="hidden sm:block"> From Competitive Matchmaking to Friendly Bouts, a challenging AI or just Spectating, you are sure to find your favorite way to enjoy this symbol of VideoGame history.
// 				</p>
// 			</div>
// 			<video
// 			class="fixed top-0 left-0 w-full h-full object-cover blur-[3px] z-[-2] pointer-events-none"
// 			autoplay
// 			muted
// 			loop
// 			playsinline
// 			preload="auto"
// 			disablepictureinpicture
// 			tabindex="-1"
// 			aria-hidden="true"
// 			style="pointer-events: none;"
// 			>
// 			<source src="images/login.webm" type="video/webm">
// 			</video>
// 		</div>
//     `
// }



export function renderHomeText (isLoged: boolean)
{
    return /* html */ `
        <div class="data flex flex-col sm:flex-row items-center justify-center sm:justify-between min-h-[calc(100vh-200px)]
        gap-4 xs:gap-5 sm:gap-8 md:gap-10 xl:gap-12 2xl:gap-16 px-3 xs:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-0">
            <div class="txt w-full sm:w-1/2 text-center sm:text-left transition-all duration-500 ${isLoged ? 'opacity-0' : ''}">
                <h1
                    class="text-[28px] xs:text-[36px] sm:text-[50px] md:text-[70px] lg:text-[90px] xl:text-[120px] 2xl:text-[135px]
                    font-bold text-txtColor glow-stroke leading-[1.1] mb-3 xs:mb-4 sm:mb-6 xl:mb-8">
                    ENTER<br/>ORBIT...
                </h1>
                <p
                    class="text-[#878787] max-w-full mx-auto sm:mx-0
                    sm:max-w-[431px] xl:max-w-[500px] text-[14px] xs:text-[15px] sm:text-[17px]
                    md:text-[19px] xl:text-[22px] leading-[1.5] xs:leading-[1.6] sm:leading-[1.7] xl:leading-[1.75] px-2 sm:px-0">
                        Welcome to SPACE PONG, where you can experience the legendary original Pong game in all its glory.
                        <br class="hidden sm:block"> From Competitive Matchmaking to Friendly Bouts, a challenging AI or just Spectating, you are sure to find your favorite way to enjoy this symbol of VideoGame history.
                </p>
            </div>
            <video
            class="fixed top-0 left-0 w-full h-full object-cover blur-[3px] z-[-2] pointer-events-none"
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
            <source src="images/login.webm" type="video/webm">
            </video>
        </div>
    `
}



export function AliasPopUp(item: string)
{
	const aliasPopUp = document.createElement('div');
	aliasPopUp.id = "Alias-popup";
	aliasPopUp.className = `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4`;
	aliasPopUp.innerHTML = /* html */`
		<div class="relative bg-gradient-to-br from-bgColor/95 to-black/90 backdrop-blur-xl
			rounded-2xl sm:rounded-3xl px-4 xs:px-6 sm:px-8 py-4 flex flex-col gap-4 sm:gap-5 w-full max-w-[420px] border-2 border-color1/30
			shadow-2xl transform transition-all duration-300 scale-100"
			style="box-shadow: 0 0 40px rgba(237, 111, 48, 0.15), 0 0 80px rgba(237, 111, 48, 0.05);">

			<button id="Cancel-alias" class="absolute top-3 right-3 sm:top-4 sm:right-4 text-color3 hover:text-txtColor transition-colors duration-300">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<div class="relative text-center mb-1 sm:mb-2">
				<img class="w-12 h-12 sm:w-16 sm:h-16 m-auto" src="images/joypad1.svg" alt="joypad">
				<h2 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-color1 via-color2 to-color1 bg-clip-text text-transparent">
					Enter Your Alias
				</h2>
				<p class="text-txtColor/50 text-xs sm:text-sm mt-1">Choose your Opponent's Alias</p>
			</div>
			<p id="alias-error" class="text-red-500 text-center text-xs sm:text-sm hidden bg-red-500/10 py-2 rounded-xl border border-red-500/30">
				⚠️ Please enter a Valid Alias
			</p>
			<div class="relative">
				<input id="alias-input" type="text" placeholder="Alias..."
					class="w-full bg-black/60 text-txtColor px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
					outline-none border-2 border-color3/30 focus:border-color1
					transition-all duration-300 text-base sm:text-lg placeholder:text-color3/50
					focus:shadow-lg focus:shadow-color1/10">
				<div class="absolute right-4 top-1/2 -translate-y-1/2 text-color3/50">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
					</svg>
				</div>
			</div>
			<div class="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
				<button id="confirm-alias" class="relative overflow-hidden bg-gradient-to-r from-color1 to-color2
					rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-4 sm:px-6 font-bold text-base sm:text-lg text-bgColor
					transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-color1/30
					active:scale-[0.98] group">
					<span class="relative z-10 flex items-center justify-center gap-2">
						Let's Go!
						<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
						</svg>
					</span>
					<div class="absolute inset-0 bg-gradient-to-r from-color2 to-color1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				</button>
			</div>
		</div>
	`;
	document.body.appendChild(aliasPopUp);
	aliasPopUp.addEventListener('click', (e) => {if (e.target === aliasPopUp) aliasPopUp.remove();});
	$("Cancel-alias")?.addEventListener('click', _=> {aliasPopUp?.remove();})
	$("confirm-alias")?.addEventListener('click', _=> {
		const AliasInput = $("alias-input") as HTMLInputElement ;
		const value = AliasInput.value.trim();
		if (value.length < 1 || value.length > 30 || value === userData.username)
			$("alias-error")?.classList.remove("hidden");
		else
		{
			sessionStorage.setItem(item, value);
			aliasPopUp?.remove();
			if (item === "player2") navigate('/pong-game?mode=local-vs-player');
		}
	})
}

export async function renderHome()
{
	document.querySelector(".login")?.remove();
	document.body.innerHTML = /* html */`
		<div id="app" class="flex-grow w-full mx-auto px-3 xs:px-14 overflow-x-hidden">
			<div class="fixed w-[45vw] h-[45vw] -z-10 rounded-full
				right-0 top-[10vh] translate-x-1/2 bg-color1 animate-animateSlow blur-[306px] pointer-events-none">
			</div>
			<div class="content mx-auto relative">
				${renderNavBar(false)}
				${renderHomeText(false)}
			</div>
		</div>
	<footer id="footer" class="w-full mx-auto flex flex-col sm:flex-row
	justify-between items-center gap-3 xs:gap-4 py-4 xs:py-6 sm:py-8 px-3 xs:px-4 text-white border-t border-slate-500 mt-auto">
			<p class="text-[#878787] text-xs xs:text-sm sm:text-base">© 2026 SPACE PONG</p>
			<div class="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4">
				<button id="terms-link" class="text-color2 hover:text-color1 transition-colors text-[10px] xs:text-xs sm:text-sm underline">Terms of Service</button>
				<button id="privacy-link" class="text-color2 hover:text-color1 transition-colors text-[10px] xs:text-xs sm:text-sm underline">Privacy Policy</button>
				<button id="about-us" class="py-1.5 xs:py-2 px-3 xs:px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-xs xs:text-sm sm:text-base">About Us</button>
			</div>
		</footer>
	`
	$('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	$('go-sign-in')!.addEventListener('click',_ => {navigate("/login")})
	$('go-sign-up')!.addEventListener('click',_ => {navigate("/sign-up")})
	$('about-us')!.addEventListener('click',_ => {navigate("/about")})
	$('terms-link')!.addEventListener('click',_ => {navigate("/terms")})
	$('privacy-link')!.addEventListener('click',_ => {navigate("/privacy")})
}
