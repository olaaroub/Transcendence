import {
	PongEngine,
	keyMap,
	createScene,
	createGUI,
	optionsButton,
	createArena,
	createSky,
	createPaddles,
	createBall,
	Renderer,
	TICKDT,
} from 'pong-shared';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const { engine, scene, cameras } = createScene(canvas);
const ui = createGUI();

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

window.addEventListener('keydown', (e) =>
{
	const cam = cameras[e.key];
	if (cam)
	{
		scene.activeCamera = cam;
		return;
	}
	const press = keyMap[e.key];
	if (press)
		gameEngine.setInput(press.player === 'p1Input' ? 1 : 2, press.value);
});

window.addEventListener('keyup', (e) =>
{
	const press = keyMap[e.key];
	if (press)
		gameEngine.setInput(press.player === 'p1Input' ? 1 : 2, 0);
});

window.addEventListener('resize', () => {
	engine.resize();
});

optionsButton(ui, scene, cameras, [ball.material, paddles.p1.material, paddles.p2.material]);

// Game loop
let lastTime = performance.now();
const gameLoop = (currentTime: number) => {
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	// Update game logic
	gameEngine.tick();

	// Update graphics from game state
	const gameState = gameEngine.getState();
	renderer.updateGameState(gameState);

	// Render scene
	renderer.render();

	requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);