import { navigate } from "../router";
import { initDashboard } from "./dashboard";
import { renderNavBar } from "./components/NavBar";

const $ = (id : string) => document.getElementById(id as string);

export async function renderGuest()
{
    document.body.innerHTML = /* html */`
		<div id="app" class="flex-grow w-[90%] mx-auto">
			<div class="absolute w-[45vw] h-[45vw] -z-10 rounded-full
				right-0 top-[10vh] translate-x-1/2 bg-color1 animate-animateSlow blur-[306px]">
			</div>
			<div class=" content mx-auto">
				${renderNavBar(false)}
                <div id="guest-content" class="h-[70vh] w-full flex justify-center items-center gap-3">
                    <button class="bg-black/40 flex-1 p-4 py-8 rounded-2xl glow-effect"><span class="text-bold text-color1 text-[100px]">Vs AI</span></button>
                    <button class="bg-black/40 flex-1 p-4 py-8 rounded-2xl glow-effect"><span class="text-bold text-color1 text-[100px]">Vs Player</span></button>
                    <button class="bg-black/40 flex-1 p-4 py-8 rounded-2xl glow-effect"><span class="text-bold text-color1 text-[100px]">Tournament</span></button>
                </div>
			</div>
		</div>
	`
    $('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
	$('go-sign-in')!.addEventListener('click',_ => {navigate("/login")})
	$('go-sign-up')!.addEventListener('click',_ => {navigate("/sign-up")})
	$('go-as-guest')!.addEventListener('click',_ => {navigate("/guest")})
}