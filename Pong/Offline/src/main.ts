import {
	PongEngine,
	keyMap,
	createScene,
	loadGameFont,
	createGUI,
	disposeGUI,
	optionsButton,
	startButton,
	addHUDs,
	updateGoals,
	createSign,
	createArena,
	createSky,
	createPaddles,
	createBall,
	Renderer,
	TICKDT,
} from 'pong-shared';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const { engine, scene, cameras } = createScene(canvas);
await loadGameFont();
createGUI();

const sky = createSky(scene);
const arena = createArena(scene);
const paddles = createPaddles(scene);
const ball = createBall(scene);

const renderer = new Renderer(
	engine,
	scene,
	{
		sky,
		arena,
		paddles,
		ball
	}
);

scene.activeCamera = cameras['1'];

const gameEngine = new PongEngine();

addHUDs(gameEngine.getSession());
optionsButton(scene, cameras, [ball.material!, paddles.p1.material!, paddles.p2.material!]);
startButton(gameEngine);

let gameInterval: number | null = null;
let gameOver: boolean = false;

const handleKeyDown = (e: KeyboardEvent) =>
{
	const cam = cameras[e.key];
	if (cam)
	{
		scene.activeCamera = cam;
		return;
	}
	const press = keyMap[e.key.toLowerCase()];
	if (press)
		gameEngine.setInput(press.player === 'p1Input' ? 1 : 2, press.value);
};

const handleKeyUp = (e: KeyboardEvent) =>
{
	const press = keyMap[e.key.toLowerCase()];
	if (press)
		gameEngine.setInput(press.player === 'p1Input' ? 1 : 2, 0);
};

const handleResize = () => { engine.resize(); };

function exitGame(): void
{
	disposeGUI();
	document.getElementById("exit-game-btn")?.click();
	if (gameInterval)
	{
		clearInterval(gameInterval);
		gameInterval = null;
	}
	window.removeEventListener('keydown', handleKeyDown);
	window.removeEventListener('keyup', handleKeyUp);
	window.removeEventListener('resize', handleResize);
	renderer.dispose();
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', handleResize);

gameInterval = setInterval(() => {gameEngine.tick();}, Math.round(TICKDT * 1000));

const renderLoop = () =>
{
	if (!(document.getElementById('game') as HTMLCanvasElement))
	{
		exitGame();
		return;
	}
	const gameState = gameEngine.getState();
	renderer.updateGameState(gameState);
	if (gameEngine.getCurrentState() === 'Over' && !gameOver)
	{
		gameOver = true;
		const winner: string = gameEngine.getWinner();
		setTimeout(() => {createSign(`GAME OVER\n${winner.length > 12 ? winner.slice(0, 12 - 1) + "..." : winner} WINS`);}, 50);
		setTimeout(() => {exitGame();}, 3000);
	}
	renderer.render();
	updateGoals(gameEngine.getState().p1, gameEngine.getState().p2);
	requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);