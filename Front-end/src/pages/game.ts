import * as data from "./dashboard"

export function renderGame() {
    data.renderDashboard(); // just brikol
    const dashContent = document.getElementById('dashboard-content');
    if (dashContent)
        dashContent.innerHTML = /* html */`
            <div class="h-[80vh] w-screen relative">
                
            </div>
        `;
}
