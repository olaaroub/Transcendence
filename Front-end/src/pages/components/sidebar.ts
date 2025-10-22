import { navigate } from "../../router";

(window as any).navigate = navigate; // must learn more about it

export function renderSidebar(): string {
	const pathname:string = window.location.pathname;
	return `
	<aside id="sidebar" class="hidden lg:flex lg:w-[250px] xl:w-[280px] 2xl:w-[308px] 3xl:w-[370px] 4xl:w-[400px] text-gray-300 p-4 xl:p-6 flex-col justify-between bg-[#0f0f0f40] backdrop-blur-xl border-r border-borderColor">
	<div>
		<img src="/images/logo.png" class="w-[100px] xl:w-[130px] my-10 xl:my-14 block mx-auto" />
		<ul class="flex flex-col gap-6 xl:gap-10 pl-4 xl:pl-[20px]">
			<li onclick="navigate('/dashboard')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/dashboard" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> 🏠 Home</li>
			<li onclick="navigate('')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/game" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> 🎮 Game</li>
			<li onclick="navigate('')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/chat" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> 💬 Chat</li>
			<li onclick="navigate('')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/tournament" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> 🏆 Tournament</li>
			<li onclick="navigate('')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/leaderboard" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> 📊 Leaderboard</li>
			<li onclick="navigate('/settings')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl ${pathname === "/settings" ? "text-[#00D9FF] " : "text-[#F0F0F0]"}"> ⚙️ Settings</li>
			<li onclick="navigate('')" class="hover:text-[#00D9FF] cursor-pointer transition-colors text-sm xl:text-base 2xl:text-lg 3xl:text-xl"> 🚪 Logout</li>
		</ul>
	</div>
	<div class="mt-6 xl:mt-10">
		<div class="w-full h-[1px] bg-[#444]"></div>
		<p class="text-[#878787] text-[11px] xl:text-[13px] p-6 xl:p-[60px]
		text-center">© 2025 GOLDEN PONG<br class="lg:hidden" /> Made By Simo</p>
	</div>
	</aside>
	`;
}
