import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderAuthPage } from "./components/loginPage"

const $ = (id: string) => document.getElementById(id as string);

function AuthRedirect()
{
	const url = new URL(window.location.href);
	const token = url.searchParams.get("token");
	const id = url.searchParams.get("id");
	if (token && id)
	{
		localStorage.setItem("token", token);
		localStorage.setItem("id", id);
		navigate("/dashboard");
	}
}

export function renderLogin (isLoged: boolean)
{
	AuthRedirect();
	document.body.innerHTML = /* html */`
		<div id="app" class="flex-grow w-[90%] mx-auto">
			${renderNavBar(true)}
		</div>
		<footer id="footer" class="w-[90%] absolute bottom-0 left-1/2 transform -translate-x-1/2
		mx-auto flex flex-col sm:flex-row justify-between items-center gap-4
		py-8 text-white border-t border-slate-500 mt-auto">
			<p class="text-[#878787] text-sm sm:text-base">© 2025 GOLDEN PONG Made By Simo</p>
			<div class="flex flex-wrap justify-center gap-3 sm:gap-4">
				<button id="terms-link" class="text-color2 hover:text-color1 transition-colors text-xs sm:text-sm underline">Terms</button>
				<button id="privacy-link" class="text-color2 hover:text-color1 transition-colors text-xs sm:text-sm underline">Privacy</button>
				<button id="about-us" class="py-2 px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-sm sm:text-base">About Us</button>
			</div>
		</footer>
	`;
	$('about-us')!.addEventListener('click',_ => {navigate("/about")})
	$('terms-link')!.addEventListener('click',_ => {navigate("/terms")})
	$('privacy-link')!.addEventListener('click',_ => {navigate("/privacy")})
	$('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	renderAuthPage(isLoged);
}
