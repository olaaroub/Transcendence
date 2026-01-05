import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderFooter } from "./components/footer"

const $ = (id: string) => document.getElementById(id as string)

export function renderHomeText (isLoged: boolean)
{
    return /* html */ `
		<div class="data flex flex-col sm:flex-row items-center justify-between min-h-[calc(100vh-200px)]
		gap-6 sm:gap-8 md:gap-10 xl:gap-12 2xl:gap-16 px-4 md:px-6 xl:px-8 2xl:px-10">
			<div class="txt sm:w-1/2 transition-all duration-500 ${isLoged ? 'opacity-0' : ''}">
				<h1
					class="text-[40px] sm:text-[70px] md:text-[80px] lg:text-[100px] xl:text-[130px] 2xl:text-[150px]
					font-bold text-txtColor glow-stroke leading-[1.1] mb-4 sm:mb-6 xl:mb-8">
					Let's play<br/>Together...
				</h1>
				<p
					class="text-[#878787] max-w-[90%]
					sm:max-w-[431px] xl:max-w-[500px] text-[16px] sm:text-[18px]
					md:text-[20px] xl:text-[22px] leading-[1.6] sm:leading-[1.7] xl:leading-[1.75] ">
						Lorem ipsum dolor sit amet consectetur, adipisicing
						elit. Ex laudantium ducimus ipsam nisi consectetur repellat voluptatum?
				</p>
			</div>
			<div class="absolute right-24 -z-10">
				<img src="/images/smi.png" alt="pong game" class="opacity-[60%]
				w-[250px] sm:w-[400px] md:w-[500px] xl:w-[600px] 2xl:w-[700px] h-auto">
			</div>
		</div>
    `
}

export function AliasPopUp(isGuest : boolean, item: string)
{
	const aliasPopUp = document.createElement('div');
	aliasPopUp.id = "Alias-popup";
	aliasPopUp.className = `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm`;
	aliasPopUp.innerHTML = /* html */`
		<div class="relative bg-gradient-to-br from-bgColor/95 to-black/90 backdrop-blur-xl
			rounded-3xl p-8 flex flex-col gap-5 w-[420px] border-2 border-color1/30
			shadow-2xl transform transition-all duration-300 scale-100"
			style="box-shadow: 0 0 40px rgba(237, 111, 48, 0.15), 0 0 80px rgba(237, 111, 48, 0.05);">
			
			<button id="Cancel-alias" class="absolute top-4 right-4 text-color3 hover:text-txtColor transition-colors duration-300">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<div class="relative text-center mb-2">
				<div class="text-5xl mb-3">🎮</div>
				<h2 class="text-2xl font-bold bg-gradient-to-r from-color1 via-color2 to-color1 bg-clip-text text-transparent">
					Enter Your Alias
				</h2>
				<p class="text-txtColor/50 text-sm mt-1">Choose a name to identify yourself</p>
			</div>
			<p id="alias-error" class="text-red-500 text-center text-sm hidden bg-red-500/10 py-2 rounded-xl border border-red-500/30">
				⚠️ Please enter a valid alias
			</p>
			<div class="relative">
				<input id="alias-input" type="text" placeholder="Your alias..."
					class="w-full bg-black/60 text-txtColor px-5 py-3 rounded-2xl
					outline-none border-2 border-color3/30 focus:border-color1 
					transition-all duration-300 text-lg placeholder:text-color3/50
					focus:shadow-lg focus:shadow-color1/10">
				<div class="absolute right-4 top-1/2 -translate-y-1/2 text-color3/50">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
					</svg>
				</div>
			</div>
			<div class="flex flex-col gap-3 mt-2">
				<button id="confirm-alias" class="relative overflow-hidden bg-gradient-to-r from-color1 to-color2 
					rounded-2xl py-3 px-6 font-bold text-lg text-bgColor
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
	
	aliasPopUp.addEventListener('click', (e) => {
		if (e.target === aliasPopUp) aliasPopUp.remove();
	});
	
	$("Cancel-alias")?.addEventListener('click', _=> {aliasPopUp?.remove();})
	$("confirm-alias")?.addEventListener('click', _=> {
		const AliasInput = $("alias-input") as HTMLInputElement ;
		const value = AliasInput.value.trim();
		if (value == "")
			$("alias-error")?.classList.remove("hidden");
		else
		{
			sessionStorage.setItem(item, value);
			aliasPopUp?.remove();
			if (isGuest)
			{		
				$("go-as-guest")!.textContent = sessionStorage.getItem(item);
				navigate("/guest");
			}
			else if (item === "player2")
				navigate('/game?mode=local-vs-player');
		}
	})
}

export async function renderHome()
{
	document.querySelector(".login")?.remove();
	document.body.innerHTML = /* html */`
		<div id="app" class="flex-grow w-[90%] mx-auto">
			<div class="absolute w-[45vw] h-[45vw] -z-10 rounded-full
				right-0 top-[10vh] translate-x-1/2 bg-color1 animate-animateSlow blur-[306px]">
			</div>
			<div class=" content mx-auto">
				${renderNavBar(false)}
				${renderHomeText(false)}
			</div>
		</div>
		<footer id="footer" class="w-[90%] absolute bottom-0 left-1/2
		transform -translate-x-1/2  mx-auto flex flex-col sm:flex-row
		justify-between items-center gap-4 py-8 text-white border-t border-slate-500 mt-auto">
			${renderFooter()}
		</footer>
	`

	$('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	$('go-sign-in')!.addEventListener('click',_ => {navigate("/login")})
	$('go-sign-up')!.addEventListener('click',_ => {navigate("/sign-up")})
	$('go-as-guest')!.addEventListener('click',_ => {AliasPopUp(true, "guest")})
	$('about-us')!.addEventListener('click',_ => {navigate("/about")})
}
