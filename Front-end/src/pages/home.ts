import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderHomeText } from "./components/ForTexts"
import { renderFooter } from "./components/footer"
import { isUserAuthenticated } from "./components/errorsHandler";

export async function renderHome()
{
	const existing = document.querySelector(".login");
	if (existing) existing.remove();
	document.body.innerHTML = `
		<div id="app" class="flex-grow w-[90%] mx-auto">
			<div class="absolute w-[45vw] h-[45vw] -z-10 rounded-full
				right-0 top-[10vh] translate-x-1/2
				bg-color1
				animate-animateSlow
				blur-[306px]">
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

	document.getElementById('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	document.getElementById('go-sign-in')!.addEventListener('click',_ => {navigate("/login")})
	document.getElementById('go-sign-up')!.addEventListener('click',_ => {navigate("/sign-up")})
	document.getElementById('about-us')!.addEventListener('click',_ => {navigate("/about")})
}
