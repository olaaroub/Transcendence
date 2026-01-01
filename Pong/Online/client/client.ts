import io from "socket.io-client"

import {
	Match,
	keyMap,
	createScene,
	createGUI,
	optionsButton,
	addHUDs,
	createArena,
	createSky,
	createPaddles,
	createBall,
	Renderer,
	GameState,
	State,
	RoomData,
	WIDTH,
} from 'pong-shared';

let match: Match =
{
	state:
	{
		p1: 0,
		p2: 0,
		p1Input: 0,
		p2Input: 0,
		p1X: 0,
		p1Y: 0,
		p2X: 0,
		p2Y: 0,
		ballX: 0,
		ballY: 0,
		ballS: 0,
	},
	currState: "Waiting",
	session:
	{
		oppAI: false,
		diff: "None",
		p1Alias: "Player 1",
		p1Avatar: "default.png",
		p2Alias: "Player 2",
		p2Avatar: "default.png",
	},
};

let gameOver: {winner: string, reason: string;} = {winner: "N/A", reason: "N/A"};
let role = 0;

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

function modifyState(state: GameState): void
{
	const gs = match.state;
	if (role === 2)
	{
		gs.p1 = state.p2;
		gs.p2 = state.p1;
		gs.p1Y = state.p2Y;
		gs.p2Y = state.p1Y;
		gs.ballX = WIDTH - state.ballX;
		gs.ballY = state.ballY;
	}
	else
	{
		gs.p1 = state.p1;
		gs.p2 = state.p2;
		gs.p1Y = state.p1Y;
		gs.p2Y = state.p2Y;
		gs.ballX = state.ballX;
		gs.ballY = state.ballY;
	}
}

function exitGame(): void
{
	const div = document.getElementById("exit-game-btn");
	div?.click();
}

const socket = io(`http://localhost:3010/`);

socket.on("state", (state: GameState) => {modifyState(state);});

socket.on("gamestate", (state: State) => {match.currState = state;});

socket.on("gameOver", (data: {winner: string, reason: string;}) => {gameOver = data;});

socket.on("countdown", (count: number) =>
{
	console.log(`Game starting in ${count}...`);
	// TODO: Visual countdown with Babylon.js
});

socket.on("redirect", () => {exitGame();});

addHUDs(match.session);
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
	if (press && role < 3 && match.currState === "Playing")
		socket.emit("input", press.value);
});

window.addEventListener('keyup', (e) =>
{
	const press = keyMap[e.key.toLowerCase()];
	if (press && role < 3 && match.currState === "Playing")
		socket.emit("input", 0);
});

window.addEventListener('resize', () => {engine.resize();});

let roomData: RoomData | null = null;
try { roomData = JSON.parse(sessionStorage.getItem('room') || 'null'); } catch {}

if (!roomData)
{
	console.error("No room data found. Redirecting to dashboard...");
	exitGame();
}
else
{
	socket.on("connect", async () =>
	{
		console.log("Connection Established. Joining room...");
		try
		{
			const response = await socket.timeout(60000).emitWithAck("match", roomData);
			if (!response)
			{
				console.error("Room not found or invalid.");
				exitGame();
				return;
			}
			match = response;
			console.log(`Joined room successfully. Waiting for game to start...`);
			modifyState(match.state);
		}
		catch (e)
		{
			console.error("Connection timeout. Please try again.");
			exitGame();
		}
	});

	socket.on("side", (side: number) =>
	{
		role = side;
		console.log(`Assigned as ${side === 3 ? 'Spectator' : `Player ${side}`}`);
	});
}

const gameLoop = () =>
{
	const gameState = match.state;
	renderer.updateGameState(gameState);
	renderer.render();

	requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);