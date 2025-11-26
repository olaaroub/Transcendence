import { mockMessages } from "../chat/mockMessages";

export function dashboardLearderboard(): string {
	return `
		<div class="w-full">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Leaderboard</h2>
			<div class="rounded-3xl text-txtColor relative flex flex-col  gap-6">
				<button class="absolute bottom-[-20px] left-1/2 -translate-x-1/2 rounded-3xl
				bg-[rgb(27_26_29_/_75%)] hover:bg-[#ed6f3033] px-4 py-2 z-10">see more</button>
				${mockMessages.map((msg, index) => `
				${index < 3 ? `
					<div class="bg-color4 glow-effect w-full rounded-2xl flex gap-3 items-center relative hover:scale-[1.02]
					hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-200 border-x-4 border-color2">
						${index == 0 ? '<img  class="absolute -top-5 -left-7 -rotate-[50deg]" src="images/king.svg">' : ''}
						<img class="rounded-full w-[70px] h-[70px]" src="${msg.avatar}">
						<span class="font-bold text-lg text-txtColor">${msg.senderName}</span>
					</div>	
					` : ''}
				`).join('')}
			</div>
		</div>
	`;
}
