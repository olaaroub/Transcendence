import { navigate } from "../../router";
import { sendAuthData } from "../../pages/sendData";
import { renderHome } from "../home";

const $ = (id : string) => document.getElementById(id as string);

function inputField(label: string, type: string, placeholder: string, isSignup: boolean) {
	return /* html */ `
    	<li>
			<h3 class="text-[#F0F0F0] text-xs md:text-sm my-1">${label}</h3>
			<input
			id=${label}
    	    type="${type}"
    	    placeholder="${placeholder}"
    	    class="w-full rounded-md bg-transparent border border-color1 focus:outline-none
			text-[#F0F0F0] pl-3 py-1.5 xs:py-2 md:py-2.5 text-xs xs:text-sm md:text-base placeholder-gray-400" required
			/>
    	</li>
	`;
}

function mainButton(label: string) {
	return /* html */ `
    <button
		class="text-center w-full bg-color1 text-[#0B0B0B] font-semibold
		rounded-md md:rounded-lg py-1.5 xs:py-2 md:py-2.5 text-sm xs:text-base hover:bg-[rgb(237_111_48_/_82%)] transition-all duration-200"
		type="submit"
    >
	${label}
    </button>
	`;
}

function socialIcons() {
	return /* html */ `
    <div class="flex justify-center gap-3 mt-2 xs:mt-3">
		<a href="api/auth/google" class="border justify-center items-center flex border-color1 w-9 h-9 xs:w-10 xs:h-10
			md:w-[60px] md:h-[36px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="Google" title="Sign in with Google" class="w-5 h-5 md:w-6 md:h-6" src="/images/googleIcon.svg"></a>
		<a href="api/auth/github" class="border justify-center items-center flex border-color1 w-9 h-9 xs:w-10 xs:h-10
			md:w-[60px] md:h-[36px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="GitHub" title="Sign in with GitHub" class="w-5 h-5 md:w-6 md:h-6" src="/images/gitIcon.svg"></a>
		<a href="api/auth/intra" class="border justify-center items-center flex border-color1 w-9 h-9 xs:w-10 xs:h-10
			md:w-[60px] md:h-[36px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="42 Network" title="Sign in with 42 Network" class="w-5 h-5 md:w-6 md:h-6" src="/images/42Icon.svg"></a>
    </div>
	`;
}

function authForm(isSignup: boolean) {
	return /* html */ `
    <form class="space-y-2 md:space-y-3">
		<ul class="space-y-0.5 xs:space-y-1 md:space-y-2">
        ${inputField(isSignup ? "Alias" : "Alias/Email", "text", isSignup ? "Alias" : "Alias or email", isSignup)}
		${isSignup ? inputField("Email", "email", "Email", isSignup) : ""}
        ${inputField("Password", "password", "Password", isSignup)}
        ${isSignup ? inputField("Confirm Password", "password", "Confirm password", isSignup) : ''}
		</ul>
		${mainButton(isSignup ? "Create Account" : "Sign In")}
    </form>
	`;
}

function footer(isSignup: boolean) {
	return /* html */ `
    <p class="w-full text-center text-[#F0F0F0] text-[11px] xs:text-xs md:text-sm mt-2 xs:mt-3">
		${
        isSignup
			? `Already have an account? <a class="font-bold text-color1 cursor-pointer hover:underline" data-action="login">Login</a>`
			: `Don't have an account yet? <a class="font-bold text-color1 cursor-pointer hover:underline" data-action="signup">Sign up Now!</a>`
	}
    </p>
	`;
}

export function renderAuthPage(isSignup = false, errorMSG = "") {
	// Only render home if it's not already rendered
	if (!document.getElementById('app')) {
		renderHome();
	}
	document.querySelector(".login")?.remove();
	document.querySelector(".login-backdrop")?.remove();
	const backdrop = document.createElement("div");

	backdrop.className = "login-backdrop fixed inset-0 z-10 bg-black backdrop-blur-sm cursor-pointer";
	document.body.appendChild(backdrop);
	const container = document.createElement("div");
	container.className = `
		login fixed z-20 top-[50%] left-1/2
		rounded-2xl md:rounded-3xl px-4 xs:px-5 sm:px-6 md:px-10 xl:px-12
		w-[90vw] xs:w-[85vw] sm:w-[300px] md:w-[380px] xl:w-[420px] 2xl:w-[460px]
		flex flex-col justify-center text-white border-[2px] border-transparent rounded-lg
		bg-[linear-gradient(90deg,#040505,#1a1e22),linear-gradient(135deg,#121212,#ed6f30)]
		opacity-0 translate-x-[-50%] translate-y-[-60%]`;
	container.style.backgroundOrigin = 'border-box';
	container.style.backgroundClip = 'padding-box, border-box';
	container.style.boxShadow = '0 0 20px rgba(237, 111, 48, 0.4)';
	container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
	setTimeout(() => {
		container.style.opacity = '1';
		container.style.transform = 'translate(-50%, -50%)';
	}, 250);
	container.innerHTML = /* html */ `
		<div class="my-3 xs:my-4 sm:my-5 md:my-6 xl:my-8 relative">
			<button id="close-auth" class="absolute -top-1 -right-2 xs:-right-3 text-color3 hover:text-txtColor transition-colors duration-300">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<h2 class="font-bold text-xl xs:text-2xl md:text-3xl xl:text-4xl text-txtColor text-center mb-2 xs:mb-3 md:mb-4">
				${isSignup ? "Sign Up" : "Login"}
				${!(errorMSG === "") ? `<p class="text-errorColor text-[10px] xs:text-xs mt-1 xs:mt-2">${errorMSG}</p>` : ""}
			</h2>
			${authForm(isSignup)}
			<h3 class="text-center text-txtColor mt-3 xs:mt-4 text-xs md:text-sm">or continue with</h3>
			${socialIcons()}
			${footer(isSignup)}
		</div>
	`;
	document.body.appendChild(container);
	const closeAuthPage = () => {
		container.remove();
		backdrop.remove();
		navigate('/');
	};
	backdrop.addEventListener('click', closeAuthPage);
	$('close-auth')?.addEventListener('click', closeAuthPage);
	if (isSignup)
		$('Alias')?.focus();
	else
		$('Alias/Email')?.focus();
}

document.body.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	const action = target.dataset.action;
	if (!action) return;
	if (action === "signup") navigate('/sign-up');
	else if (action === "login") navigate('/login');
});

function validateInfos(inputs : NodeListOf<HTMLInputElement>)  : string
{
	if (inputs[0].value.length < 1 || inputs[0].value.length > 30)
		return "Invalid Username";
	if (inputs[2].value !== inputs[3].value)
		return "Passwords do not match";
	if (inputs[2].value.length < 8 || inputs[2].value.length > 30)
		return "Invalid Password";
	return "";
}

document.body.addEventListener("submit", (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const inputs = form.querySelectorAll("input");
	let path: string = 'login';

	if (inputs.length == 4)
	{
		path = 'signUp';
		const errorMSG = validateInfos(inputs);
		if (errorMSG !== "")
		{
			renderAuthPage(true, errorMSG);		
			return ;
		}
	}
	const data: Record<string, string> = {};
	inputs.forEach((input) => {
		if (input.placeholder.toLowerCase() != 'confirm password')
			data[input.placeholder.toLowerCase()] = input.value;
	});
	sendAuthData(data, path);
});
