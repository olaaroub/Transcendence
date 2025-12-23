
import { costumeButton } from "./buttons";

export function renderFooter ()
{
    return /* html */ `
		<p class="text-[#878787] text-sm sm:text-base">© 2025 GOLDEN PONG Made By Simo</p>
		${costumeButton("About Us", "", "", "py-2 px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-sm sm:text-base", "about-us")}
    `
}
