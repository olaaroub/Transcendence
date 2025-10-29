import * as data from "./dashboard"

export function renderGame() {
    data.renderDashboard(); // just brikol
    const dashContent = document.getElementById('dashboard-content');
    if (dashContent)
        dashContent.innerHTML = `
            <div class="h-[80vh] w-screen relative">
                <div class="font-bold text-4xl text-color1 absolute
                left-1/2 bottom-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center">
                    WAITING FOR HAMZA
                    <span class="relative ml-2 after:content-['.'] after:animate-dots"></span>
                </div>
            </div>
        `;
}
