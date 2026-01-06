import { showErrorMessage, isUserAuthenticated } from "./pages/components/errorsHandler";

const app = document.getElementById("app");

let previousPath: string = "/dashboard";

const protectedRoutes = ["/dashboard", "/settings", "/game", "/chat", "/profile", "/leaderboard"];
const authRoutes = ["/login", "/sign-up"];
const publicRoutes = ["/", "/about", "/guest"];

function isProtectedRoute(path: string): boolean {
	return protectedRoutes.some(route => path === route || path.startsWith(route + "/"));
}

function isAuthRoute(path: string): boolean {
	return authRoutes.includes(path);
}

function hasCredentials(): boolean {
	const id = localStorage.getItem('id');
	const token = localStorage.getItem('token');
	return !!(id && token);
}

interface Route {
	path: string;
	render: (params: Record<string, string>) => Promise<void>;
}

const routes: Route[] = [
	{
		path: "/",
		render: async () => {
			const { renderHome } = await import("./pages/home");
			renderHome();
		},
	},
	{
		path: "/about",
		render: async () => {
			const { renderAbout } = await import("./pages/about");
			renderAbout();
		},
	},
	{
		path: "/login",
		render: async () => {
			const { renderLogin }  = await import("./pages/login");
			renderLogin(false);
		}
	},
	{
		path: "/sign-up",
		render: async () => {
			const { renderLogin }  = await import("./pages/login");
			renderLogin(true);
		}
	},
	{
		path: "/dashboard",
		render: async () => {
			const { initDashboard }  = await import("./pages/dashboard");
			initDashboard();
		}
	},
	{
		path: "/settings",
		render: async () => {
			const { renderSettings }  = await import("./pages/settings");
			renderSettings();
		}
	},
	{
		path: "/game",
		render: async () => {
			const { renderGame }  = await import("./pages/game");
			renderGame();
		}
	},
	{
		path: "/profile/:id",
		render: async (params) => {
			const { renderProfile }  = await import("./pages/profile");
			renderProfile(params.id || null);
		}
	},
	{
	path: "/chat",
		render: async () => {
			const { renderChat } = await import("./pages/chat/chat");
			renderChat();
		},
	},
	{
		path: "/leaderboard",
		render: async () => {
			const { renderLeaderboard } = await import("./pages/components/leaderboard");
			renderLeaderboard();
		},
	},
	{
		path: "/guest",
		render: async (params) => {
			const { renderGuest }  = await import("./pages/guestPage");
			renderGuest();
		}
	},
];

export function navigate(path: string) {
	const current = window.location.pathname;
	if (current === path) return;
	
	const authenticated = hasCredentials();
	
	if (!authenticated && isProtectedRoute(path)) {
		previousPath = current;
		window.history.pushState({}, "", "/login");
		router();
		return;
	}
	
	if (authenticated && (isAuthRoute(path) || path === "/")) {
		previousPath = current;
		window.history.pushState({}, "", "/dashboard");
		router();
		return;
	}
	
	previousPath = current;
	window.history.pushState({}, "", path);
	router();
}

export function navigateBack() {
	navigate(previousPath || "/dashboard");
}

function matchRoute(path: string, routePath: string) : { matched: boolean, params?: Record<string, string> } {
	const routeParts = routePath.split("/").filter(Boolean);
	const pathParts = path.split("/").filter(Boolean);

	if (routeParts.length !== pathParts.length)
		return { matched: false };
	const params: Record<string, string> = {};
	for (let i = 0; i < routeParts.length; i++) {
		if (routeParts[i].startsWith(":"))
			params[routeParts[i].slice(1)] = pathParts[i];
		else if (routeParts[i] !== pathParts[i])
			return { matched: false };
	}
	return {matched : true, params: Object.keys(params).length > 0 ? params : undefined};
}
export async function router() {
	const path = window.location.pathname;
	let params: Record<string, string> = {};
	let matchedRoute: Route | undefined;
	const authenticated = hasCredentials();

	if (!authenticated && isProtectedRoute(path)) {
		window.history.replaceState({}, "", "/login");
		const { renderLogin } = await import("./pages/login");
		renderLogin(false);
		return;
	}

	if (authenticated && (isAuthRoute(path) || path === "/")) {
		const isValid = await isUserAuthenticated();
		if (isValid) {
			window.history.replaceState({}, "", "/dashboard");
			const { initDashboard } = await import("./pages/dashboard");
			initDashboard();
			return;
		}
		return;
	}

	for (const route of routes) {
		const { matched, params: routeParams } = matchRoute(path, route.path);
		if (matched) {
			matchedRoute = route;
			params = routeParams || {};
			break;
		}
	}
	if (matchedRoute)
		await matchedRoute.render(params);
	else
		showErrorMessage("Page not found", 404);
}

window.addEventListener("popstate", router);
