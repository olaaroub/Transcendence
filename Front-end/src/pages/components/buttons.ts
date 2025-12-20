// <button id="go-sign-up" class="py-2 px-4 sm:px-6 border text-color2 border-color2
// 					rounded-lg transition-all opacity-70 duration-500 hover:bg-color2
// 					hover:text-black font-bold text-sm sm:text-base">Sign Up</button>

export function costumeButton(content: string, width: string, icon:string, colors:string[], id:string = "") : string
{
	return /* html */ `
		<button id="${id}" class="bg-${colors[0]} py-2 px-4 sm:px-6
        text-${colors[1]} border border-${colors[2]}
        transition-all duration-500 hover:bg-${colors[2]} rounded-lg
        hover:text-black font-bold text-sm sm:text-base opacity-70
        ">${content}</button>
	`
}
