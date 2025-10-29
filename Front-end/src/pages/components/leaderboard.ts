
export function renderLeaderboard(): string {
	return `
		<div class="">
			<h2 class="text-txtColor font-bold text-2xl">Leaderboard</h2>
			<div class="rounded-3xl text-txtColor relative px-8">
			
				<button id="prev" class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[40px]
				h-[40px] bg-color2 p-2 rounded-full hover:bg-[#d18a10] transition-colors
				flex items-center justify-center text-white text-2xl font-bold shadow-lg">‹</button>
				<button id="next" class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[40px] 
				h-[40px] bg-color2 p-2 rounded-full hover:bg-[#d18a10] transition-colors 
				flex items-center justify-center text-white text-2xl font-bold shadow-lg">›</button>

				<div id="content-slider" class="overflow-hidden h-[300px] flex items-center">
					<div id="slider" class="flex gap-10 transition-transform duration-300 ease-in-out">
						${Array(10).fill("").map((_,i) => `
							<div class="bg-color4 rounded-3xl h-[250px] w-[200px] min-w-[200px]
							flex flex-col items-center justify-end relative flex-shrink-0 pb-8
							bg-gradient-to-b from-transparent to-black/50 hover:scale-105 
							transition-transform duration-300 shadow-xl">
								${i === 0 ? `<div class="absolute -top-[30px] left-0 -rotate-12">` : ''}
								${i === 0 ? `<img src="images/king.svg" alt="crown" class="w-[50px] h-[50px]">` : ''}
								${i === 0 ? `</div>` : ''}
								<img src="images/1.png" alt="avatar" class="w-[90px] h-[90px] absolute
								top-4 left-4 object-cover rounded-2xl border-2 border-color2/30">
								<span class="font-bold text-4xl text-color2 uppercase
								tracking-wider drop-shadow-lg">${i === 0 ? 'simo' : i === 1 ? 'second' : `player${i + 1}`}</span>
								<span class="absolute top-4 right-4 text-color2
								text-[60px] font-black drop-shadow-lg leading-none">${i + 1}</span>
							</div>
						`).join("")}
					</div>
				</div>
			</div>
		</div>
	`;
}