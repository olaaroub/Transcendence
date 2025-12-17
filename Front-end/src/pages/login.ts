import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";
import { renderFooter } from "./components/footer"
import { renderAuthPage } from "./components/loginPage"


const $ = (id: string) => document.getElementById(id as string);

function AuthRedirect()
{
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const id = url.searchParams.get("id");
    if (token && id)
    {
        localStorage.setItem("token", token);
        localStorage.setItem("id", id);
        navigate("/dashboard");
    }
}

export function renderLogin (isLoged: boolean)
{
    AuthRedirect();
    document.body.innerHTML = `
        <div id="app" class="flex-grow w-[90%]  mx-auto">
            ${renderNavBar(true)}
        </div>
        <footer id="footer" class="w-[90%] absolute bottom-0 left-1/2 transform -translate-x-1/2
        mx-auto flex flex-col sm:flex-row justify-between items-center gap-4
		py-8 text-white border-t border-slate-500 mt-auto">
			${renderFooter()}
		</footer>
    `;
    $('about-us')!.addEventListener('click',_ => {navigate("/about")})
	$('navBar-logo')!.addEventListener('click',_ => {navigate("/")})
    $('Username')?.focus();
    renderAuthPage(isLoged);
}
