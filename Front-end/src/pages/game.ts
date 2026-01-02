import { navigate } from "../router";
import { userData, getImageUrl } from "./store";
import { initDashboard } from "./dashboard";

export async function renderGame() {
    await initDashboard(false);

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'local-vs-player';
    const difficulty = urlParams.get('difficulty') || 'Normal';

    const gameSession = {
        oppAI: mode === 'local-vs-ai',
        diff: mode === 'local-vs-ai' ? difficulty : 'None',
        p1Alias: userData.username,
        p1Avatar: getImageUrl(userData.avatar_url),
        p2Alias: mode === 'local-vs-ai' ? 'AI' : 'Player 2',
        p2Avatar: '/game/default.png'
    };

    sessionStorage.setItem('gameSession', JSON.stringify(gameSession));

    document.body.innerHTML = /* html */`
        <div class="relative inset-0 bg-black overflow-hidden">
            <button id="exit-game-btn"
                class="m-5 z-[999] bg-white/10 text-white border border-white/50
                px-5 py-2.5 font-sans rounded-lg backdrop-blur transition-all duration-200
                hover:bg-red-500/50 hover:border-red-500">
                ← EXIT GAME
            </button>
            <canvas id="game"class="w-[100%] h-[80%]"></canvas>
        </div>
    `;

    // Load the game script AFTER the canvas is in the DOM
    const script = document.createElement('script');
    script.src = '/game/offline/main.js';
    script.type = 'module';
    document.body.appendChild(script);

    const exitBtn = document.getElementById('exit-game-btn');
    exitBtn?.addEventListener('click', () => {
        navigate('/dashboard');
    });
}
