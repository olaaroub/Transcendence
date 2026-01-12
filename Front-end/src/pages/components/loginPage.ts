import { navigate } from "../../router";
import { sendAuthData } from "../../pages/sendData";
import { renderHome } from "../home";

const $ = (id : string) => document.getElementById(id as string);

function inputField(label: string, type: string, placeholder: string, isSignup: boolean) {
	if (label == "Username")
	{
		if (isSignup) label = "Alias";
		else label = "Alias/Email";
	}
	return /* html */ `
    <li>
		<h3 class="text-[#F0F0F0] text-sm md:text-base my-2">${label}</h3>
		<input
		id=${label}
        type="${type}"
        placeholder="${placeholder}"
        class="w-full rounded-md bg-transparent border border-color1 focus:outline-none
		text-[#F0F0F0] pl-4 py-2 md:py-3 text-sm md:text-base placeholder-gray-400" required
		/>
    </li>
	`;
}

function mainButton(label: string) {
	return /* html */ `
    <button
		class="text-center w-full bg-color1 text-[#0B0B0B] font-semibold
		rounded-md md:rounded-lg py-2 md:py-3 hover:bg-[rgb(237_111_48_/_82%)] transition-all duration-200"
		type="submit"
    >
	${label}
    </button>
	`;
}

function socialIcons() {
	return /* html */ `
    <div class="flex justify-center gap-4 mt-4">
		<a href="api/auth/google" class="border justify-center items-center flex border-color1 w-6 h-6
			md:w-[70px] md:h-[40px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="Google" title="Sign in with Google" class="w-[30px] h-[30px]" src="/images/googleIcon.svg"></a>
		<a href="api/auth/github" class="border justify-center items-center flex border-color1 w-6 h-6 md:w-[70px]
			md:h-[40px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="GitHub" title="Sign in with GitHub" class="w-[30px] h-[30px]" src="/images/gitIcon.svg"></a>
		<a href="api/auth/intra" class="border justify-center items-center flex border-color1 w-6 h-6 md:w-[70px]
			md:h-[40px] rounded-lg cursor-pointer hover:scale-110 transition"><img alt="42 Network" title="Sign in with 42 Network" class="w-[30px] h-[30px]" src="/images/42Icon.svg"></a>
    </div>
	`;
}

function authForm(isSignup: boolean) {
	return /* html */ `
    <form class="space-y-3 md:space-y-5">
		<ul class="space-y-2 md:space-y-3 xl:space-y-4 ">
        ${inputField("Username", "text", "Alias or email", isSignup)}
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
    <p class="w-full text-center text-[#F0F0F0] text-sm md:text-base mt-4">
		${
        isSignup
			? `Already have an account? <a class="font-bold text-color1 cursor-pointer hover:underline" data-action="login">Login</a>`
			: `Don't have an account yet? <a class="font-bold text-color1 cursor-pointer hover:underline" data-action="signup">Sign up Now!</a>`
	}
    </p>
	`;
}

export function renderAuthPage(isSignup = false, errorMSG = "") {
	renderHome();
	document.querySelector(".login")?.remove();
	document.querySelector(".login-backdrop")?.remove();
	const isValid = errorMSG === "";

	const backdrop = document.createElement("div");
	backdrop.className = "login-backdrop fixed inset-0 z-10 bg-black/70 backdrop-blur-sm cursor-pointer";
	document.body.appendChild(backdrop);

	const container = document.createElement("div");
	container.className = `
		login fixed z-20 top-[50%] left-1/2
		rounded-2xl md:rounded-3xl px-8 md:px-12 xl:px-14
		w-[90vw] sm:w-[320px] md:w-[400px] xl:w-[450px] 2xl:w-[500px] 4k:w-[600px]
		flex flex-col justify-center text-white border-[2px] border-transparent rounded-lg
		bg-[linear-gradient(90deg,#040505,#1a1e22),linear-gradient(135deg,#121212,#ed6f30)]
		max-h-[90vh] sm:max-h-[80vh] overflow-y-auto
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
		<div class="my-6 md:my-8 xl:my-10 relative">
			<button id="close-auth" class="absolute -top-2 -right-4 text-color3 hover:text-txtColor transition-colors duration-300">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<h2 class="font-bold text-3xl md:text-4xl xl:text-5xl text-txtColor text-center mb-4 2xl:mb-6">
				${isSignup ? "Sign Up" : "Login"}
				${!isValid ? `<p class="text-errorColor text-xs mt-4">${errorMSG}</p>` : ""}
			</h2>
			${authForm(isSignup)}
			<h3 class="text-center text-txtColor mt-6 text-sm md:text-base">or continue with</h3>
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
	$('Alias/Email')?.focus();
}

document.body.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	const action = target.dataset.action;
	if (!action) return;

	if (action === "signup") navigate('/sign-up');
	else if (action === "login") navigate('/login');
});

document.body.addEventListener("submit", (e) => {
	e.preventDefault();
	const form = e.target as HTMLFormElement;
	const inputs = form.querySelectorAll("input");
	let path: string = 'login';

	if (inputs.length == 4)
	{
		path = 'signUp';
		if (inputs[2].value !== inputs[3].value)
		{
			renderAuthPage(true, "Passwords do not match");
			return;
		}
	}
	const data: Record<string, string> = {};
	inputs.forEach((input) => {
		if (input.placeholder.toLowerCase() != 'confirm password')
			data[input.placeholder.toLowerCase()] = input.value;
	});
	sendAuthData(data, path);
});
