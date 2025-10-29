function renderRank() : string
{
	return `
		<div class="rank grid grid-cols-2 p-6 grid-rows-2
        w-full h-auto  flex-1
         gap-4">
            <div class="bg-color9 transition-all duration-500 hover:bg-color10 rounded-2xl p-6">
                <p class="text-sm">Total Wins</p>
                <p class="text-4xl font-bold text-txtColor">127</p>
                <p class="text-sm text-color15">+12 this week</p>
				<img class="opacity-15 translate-x-9 translate-y-9 " src="images/winIcon.svg" alt="">
				
            </div>
            <div class="bg-color9 transition-all duration-500 hover:bg-color10 rounded-2xl p-6">
                <p class="text-sm">Win Rate</p>
                <p class="text-4xl font-bold text-txtColor">74.7%</p>
                <p class="text-sm text-blue-600">Above average</p>
            </div>
            <div class="bg-color9 transition-all duration-500 hover:bg-color10 rounded-2xl p-6">
                <p class="text-sm">Current Streak</p>
                <p class="text-4xl font-bold text-txtColor">8</p>
                <p class="text-sm text-orange-400">Personal best!</p>
            </div>
            <div class="bg-color9 transition-all duration-500 hover:bg-color10 rounded-2xl p-6">
                <p class="text-sm">Rating</p>
                <p class="text-4xl font-bold text-txtColor">2847</p>
                <p class="text-sm text-[#8261BE]">Diamond III</p>
				<img class="opacity-15 translate-x-7 translate-y-9 " src="images/ratingIcon.svg" alt="">
            </div>
        </div>
	`
}

function renderRecently() : string
{
	return `
		<div class="p-6 flex-1">
			<div class="matches w-full bg-color4 rounded-xl p-9">
				<div class="flex justify-between  mb-9">
        		        <h2 class="text-color5 text-2xl font-bold">Recent Matches</h2>
        		        <button class="text-black font-bold bg-color9 px-4 py-2
						hover:scale-105 rounded-xl transition-all hover:bg-color10 ">View All</button>
        		</div>
				<div class="flex flex-col gap-3">
				${Array(5).fill("").map((_,i)=>`
        		    <div class="flex bg-color9 px-4 py-2 rounded-2xl justify-between
					hover:bg-color10 transition-all duration-500">
        		        <div class="flex items-center gap-2">
        		            <p class="bg-color15 rounded-full h-3 w-3"></p>
        		            <p class="text-black font-bold" >vs CyberNinja</p>
        		        </div>
        		        <div class="text-center">
        		            <p class="text-color14 font-bold text-xl">WIN</p>
        		            <p class="text-black">11-5</p>
        		        </div>
        			</div>`).join("")}
				</div>
			</div>
		</div>
	`
}

export function renderTrending(): string
{
	return `
		<div class="flex flex-col xl:flex-row">
			
			${renderRecently()}
			${renderRank()}
		</div>
	`;
}
