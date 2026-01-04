import { navigate } from "../router";
import { userData, getImageUrl } from "./store";
import { initDashboard } from "./dashboard";

export async function renderGame() {
    await initDashboard(false);

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isOffline = mode == "local-vs-player" || mode == "local-vs-ai";
    
    if (isOffline)
    {
        const difficulty = urlParams.get('difficulty');
        const gameSession = {
            oppAI: mode === 'local-vs-ai',
            diff: mode === 'local-vs-ai' ? difficulty : 'None',
            p1Alias: userData.username,
            p1Avatar: getImageUrl(userData.avatar_url),
            p2Alias: mode === 'local-vs-ai' ? 'AI' : 'Player 2',
            p2Avatar: '/game/Assets/default.png'
        };
        sessionStorage.setItem('gameSession', JSON.stringify(gameSession));
    }

    document.body.className = 'm-0 p-0';
    document.body.innerHTML = /* html */`
        <div class="bg-black fixed inset-0 flex flex-col overflow-hidden">
            <div class="shrink-0 p-5">
                <button id="exit-game-btn"
                    class="bg-white/10 text-white border border-white/50
                    px-5 py-2.5 font-sans rounded-lg backdrop-blur transition-all duration-200
                    hover:bg-red-500/50 hover:border-red-500">
                    ← EXIT GAME
                </button>
            </div>
            <div class="flex-1 flex items-center justify-center min-h-0 px-5 pb-5">
                <canvas id="game" class="block w-full h-[95%]"></canvas>
            </div>
        </div>
    `;

    const script = document.createElement('script');
    if (isOffline)
        script.src = `/game/offline/main.js?t=${Date.now()}`; // For Online: /game/online/client.js
    else
        script.src = `/game/online/client.js?t=${Date.now()}`;
    script.type = 'module';
    document.body.appendChild(script);

    const exitBtn = document.getElementById('exit-game-btn');
    exitBtn?.addEventListener('click', () => {
        document.body.className = 'm-0 min-h-screen flex flex-col bg-bgColor overflow-x-hidden';
        navigate('/dashboard');
    });
}
