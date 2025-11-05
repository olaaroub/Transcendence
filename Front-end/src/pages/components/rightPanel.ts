export function renderRightPanel(): string {
	return `
		<div class="flex flex-col gap-3 py-3 px-3 group bg-color4 rounded-[20px] transition-all
		duration-200 h-[400px] overflow-y-auto">
			${Array(6)
			.fill("")
			.map(
			(_, i) => `
				<div class="flex items-center group-hover:space-x-3 cursor-pointer hover:scale-105 transition-all duration-150">
					<img class=" w-[45px] h-[45px] rounded-full flex-shrink-0 border-[2px] border-color1" src="/images/1.png" />
					<p class="opacity-0 max-w-0 text-txtColor transition-all duration-500 group-hover:opacity-100
					group-hover:max-w-[150px] font-semibold text-xs sm:text-sm 3xl:text-lg truncate">
						Propw
					</p>
				</div>
			`
			)
			.join("")}
		</div>
	`;
}
