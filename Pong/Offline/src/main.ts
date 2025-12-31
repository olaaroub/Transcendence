import {
	PongEngine,
	keyMap,
	createScene,
	createGUI,
	optionsButton,
	addHUDs,
	scoreGoal,
	createArena,
	createSky,
	createPaddles,
	createBall,
	Renderer,
	TICKDT,
} from 'pong-shared';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const { engine, scene, cameras } = createScene(canvas);
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

window.addEventListener('keydown', (e) =>
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
});

window.addEventListener('keyup', (e) =>
{
	const press = keyMap[e.key];
	if (press)
		gameEngine.setInput(press.player === 'p1Input' ? 1 : 2, 0);
});

window.addEventListener('resize', () => {engine.resize();});

let lastTime = performance.now();
let accumulator = 0;

const gameLoop = (currentTime: number) =>
{
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	const clampedDelta = Math.min(deltaTime, 0.1);
	accumulator += clampedDelta;
	while (accumulator >= TICKDT)
	{
		gameEngine.tick();
		accumulator -= TICKDT;
	}
	const gameState = gameEngine.getState();
	renderer.updateGameState(gameState);
	renderer.render();

	requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);