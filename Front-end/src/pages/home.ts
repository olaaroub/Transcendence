import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderFooter } from "./components/footer"

const $ = (id: string) => document.getElementById(id as string)

function renderHomeText (isLoged: boolean)
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
	aliasPopUp.className = `h-screen absolute w-screen bg-[#000000c9]`;
	aliasPopUp.innerHTML = /* html */`
		<div class="bg-[#1a1e22] top-1/2 left-1/2 absolute z-20 transform -translate-x-1/2
		-translate-y-1/2 rounded-2xl p-6 flex flex-col gap-3 w-[400px]">
			<span class="text-bold text-[20px] text-txtColor">Enter Your Alias</span>
			<p id="alias-error" class="text-red-500 text-center hidden">Invalid Alias</p>
			<input id="alias-input" type="text" placeholder="Alias"
			class=" bg-black text-txtColor px-4 py-2 rounded-2xl
			outline-none border border-color3 focus:border-color1 transition-colors">
			<button id="confirm-alias" class="bg-color1 rounded-2xl py-2 p-3 font-bold
			transition-all duration-300 hover:bg-[rgb(237_111_48_/_82%)]">Confirm</button>
			<button id="Cancel-alias" class="bg-red-500 rounded-2xl py-2 p-3 font-bold
			transition-all duration-300 hover:bg-red-600">Cancel</button>
		</div>
	`;
	document.body.appendChild(aliasPopUp);
	$("Cancel-alias")?.addEventListener('click', _=> {
		aliasPopUp?.remove();
	})
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
