import { navigate } from "../router";
import { userData, getImageUrl } from "./store";
import { initDashboard } from "./dashboard";
import { shortString } from "./utils";

export async function renderGame() {
    await initDashboard(false);

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isOffline = mode == "local-vs-player" || mode == "local-vs-ai";

    if (isOffline)
    {
        const difficulty = urlParams.get('difficulty');
        const player2Alias = sessionStorage.getItem('player2') || 'Player 2';
        const gameSession = {
            oppAI: mode === 'local-vs-ai',
            diff: mode === 'local-vs-ai' ? difficulty : 'None',
            p1Alias: shortString(userData.username, 12),
            p1Avatar: getImageUrl(userData.avatar_url),
            p2Alias: mode === 'local-vs-ai' ? 'AI' : shortString(player2Alias, 12),
            p2Avatar: mode ==='local-vs-ai' ? '/game/Assets/ai.png' : '/game/Assets/default.png'
        };
        sessionStorage.setItem('gameSession', JSON.stringify(gameSession));
    }

    document.body.className = 'm-0 p-0';
    document.body.innerHTML = /* html */`
        <div class="bg-black fixed inset-0 flex flex-col overflow-hidden">
            <div id="exit-game-btn" class="shrink-0 p-1 group relative h-12 w-12 cursor-pointer">
				<img  src="/images/exit.svg" alt="Exit" class="absolute inset-1 transition-opacity duration-500 inline-block w-12 h-12 group-hover:opacity-0"/>
				<img  src="/images/exit2.svg" alt="Exit" class="absolute inset-1 transition-opacity duration-500 inline-block w-12 h-12 opacity-0 group-hover:opacity-100"/>
            </div>
            <div class="flex-1 flex items-center justify-center min-h-0 px-5 pb-5">
                <canvas id="game" class="block w-full h-[95%]"></canvas>
            </div>
        </div>
    `;

    const script = document.createElement('script');
    if (isOffline)
        script.src = `/game/offline/main.js?t=${Date.now()}`;
    else
    {
        script.src = `/game/online/client.js?t=${Date.now()}`;
    }
    script.type = 'module';
    document.body.appendChild(script);

    const exitBtn = document.getElementById('exit-game-btn');
    exitBtn?.addEventListener('click', () => {
        document.body.className = 'm-0 min-h-screen flex flex-col bg-bgColor overflow-x-hidden';
        navigate('/dashboard');
    });
}
