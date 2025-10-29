import { showErrorMessage } from "./pages/components/errorsHandler";

const app = document.getElementById("app");

interface Route {
    path: string;
    render: () => Promise<void>;
}

const routes: Route[] = [
    {
        path: "/",
        render: async () => {
            const { renderHome } = await import("./pages/home");
            renderHome(app!);
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
        path: "/profile",
        render: async () => {
            const { renderProfile }  = await import("./pages/profile");
            renderProfile();
        }
    },
];

export function     navigate(path: string) {
    const current = window.location.pathname;
    if (current === path) return;
    console.log("navigate called ->", path);
    window.history.pushState({}, "", path);
    router();
}

export async function router() {
    const path = window.location.pathname;
    const route = routes.find(r => r.path === path);

    if (route) {
        await route.render();
    } else {
        showErrorMessage("Page not found", 404);
    }
}

window.addEventListener("popstate", router);
