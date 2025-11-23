import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderFooter } from "./components/footer"
import { renderAuthPage } from "./components/loginPage"

const footer = document.getElementById('footer');

const $ = (id: string) => document.getElementById(id as string);

export function renderLogin (isLoged: boolean)
{
    document.body.innerHTML = `
        <div id="app" class="flex-grow w-[90%]  mx-auto">
            <div class=" content mx-auto">
                ${renderNavBar(true)}
            </div>
        </div>
        <footer id="footer" class="w-[90%] absolute bottom-0 left-1/2 transform -translate-x-1/2
        mx-auto flex flex-col sm:flex-row justify-between items-center gap-4
		py-8 text-white border-t border-slate-500 mt-auto">
			${renderFooter()}
		</footer>
    `;
	document.getElementById('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
    renderAuthPage(isLoged);
    $('Username')?.focus();
    console.log('data : ', $('Username'));
}
