import { renderDashboard } from "./dashboard";
import { navigate } from "../router";

export function renderGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'local-vs-player';
    const difficulty = urlParams.get('difficulty') || 'Normal';

    const gameSession = {
        oppAI: mode === 'local-vs-ai',
        diff: mode === 'local-vs-ai' ? difficulty : 'None',
        p1Alias: 'Player 1',
        p1Avatar: 'default.png',
        p2Alias: mode === 'local-vs-ai' ? 'AI' : 'Player 2',
        p2Avatar: 'default.png'
    };

    sessionStorage.setItem('gameSession', JSON.stringify(gameSession));

    document.body.innerHTML = /* html */`
        <div class="fixed inset-0 bg-black overflow-hidden">
            <button id="exit-game-btn"
                class="absolute top-5 left-5 z-[999] bg-white/10 text-white border border-white/50
                px-5 py-2.5 cursor-pointer font-sans rounded-lg backdrop-blur transition-all duration-200
                hover:bg-red-500/50 hover:border-red-500">
                ← EXIT GAME
            </button>
            <iframe id="game-iframe"
                class="w-full h-full">
            </iframe>
        </div>
    `;

    const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (gameIframe) {
        gameIframe.src = '/api/game/index.html';

        gameIframe.onload = () => {
            if (gameIframe.contentWindow) {
                try {
                    const iframeSession = gameIframe.contentWindow.sessionStorage.getItem('gameSession');

                    if (!iframeSession) {
                        gameIframe.contentWindow.sessionStorage.setItem('gameSession', JSON.stringify(gameSession));
                        console.log('Session manually set in iframe sessionStorage');
                    }
                } catch (e) {
                    console.error('Could not access iframe sessionStorage:', e);
                }
                gameIframe.contentWindow.focus();
            }
        };
        setTimeout(() => gameIframe.contentWindow?.focus(), 100);
    }
    const exitBtn = document.getElementById('exit-game-btn');
    exitBtn?.addEventListener('click', () => {
        navigate('/dashboard');
    });
}
