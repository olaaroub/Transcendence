// <button id="go-sign-up" class="py-2 px-4 sm:px-6 border text-color2 border-color2
// 					rounded-lg transition-all opacity-70 duration-500 hover:bg-color2
// 					hover:text-black font-bold text-sm sm:text-base">Sign Up</button>

export function costumeButton(content: string, width: string, icon:string, classNames:string, id:string = "") : string
{
	return /* html */ `
		<button id="${id}" class="${classNames}">${content}</button>
	`
}
