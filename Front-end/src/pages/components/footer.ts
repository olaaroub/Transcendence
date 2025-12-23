
import { costumeButton } from "./buttons";

export function renderFooter ()
{
    return /* html */ `
		<p class="text-[#878787] text-sm sm:text-base">© 2025 GOLDEN PONG Made By Simo</p>
		${costumeButton("About Us", "", "", ["", "color2", "color2"], "about-us")}
    `
}
