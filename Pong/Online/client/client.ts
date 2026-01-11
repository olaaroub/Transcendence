import io from "socket.io-client"

import {
	Match,
	keyMap,
	createScene,
	loadGameFont,
	createGUI,
	optionsButton,
	addHUDs,
	updateGoals,
	catchUpGoals,
	createSign,
	createArena,
	createSky,
	createPaddles,
	createBall,
	Renderer,
	GameState,
	State,
	RoomData,
	WIDTH,
	PWIDTH,
	HEIGHT,
	PHEIGHT,
	BSPEED
} from 'pong-shared';

let match: Match =
{
	state:
	{
		p1: 0,
		p2: 0,
		p1Input: 0,
		p2Input: 0,
		p1X: WIDTH - 5 - PWIDTH,
		p1Y: (HEIGHT - PHEIGHT) / 2,
		p2X: 5,
		p2Y: (HEIGHT - PHEIGHT) / 2,
		ballX: WIDTH / 2,
		ballY: HEIGHT / 2,
		ballS: BSPEED,
	},
	currState: "Waiting",
	session:
	{
		oppAI: false,
		diff: "None",
		p1Alias: "Player 1",
		p1Avatar: "/game/Assets/default.png",
		p2Alias: "Player 2",
		p2Avatar: "/game/Assets/default.png",
	},
};

let role = 0;

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

const handleKeyDown = (e: KeyboardEvent) =>
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
};

const handleKeyUp = (e: KeyboardEvent) =>
{
	const press = keyMap[e.key.toLowerCase()];
	if (press && role < 3 && match.currState === "Playing")
		socket.emit("input", 0);
};

const handleResize = () => { engine.resize(); };

function exitGame(): void
{
	document.getElementById("exit-game-btn")?.click();
	window.removeEventListener('keydown', handleKeyDown);
	window.removeEventListener('keyup', handleKeyUp);
	window.removeEventListener('resize', handleResize);
	socket.disconnect();
	renderer.dispose();
}

const socket = io(window.location.origin, { path: '/api/game/socket.io/' });

socket.on("state", (state: GameState) => {modifyState(state);});

socket.on("gamestate", (state: State) => {match.currState = state;});

socket.on("gameOver", (winner: string) => {createSign(`GAME OVER\n${winner.length > 12 ? winner.slice(0, 12 - 1) + "..." : winner} WINS`);});

socket.on("redirect", () => {exitGame();});

socket.on("session", (session: Match['session']) =>
{
	match.session = session;
	if (role === 2)
	{
		const tempAlias = match.session.p1Alias;
		const tempAvatar = match.session.p1Avatar;
		match.session.p1Alias = match.session.p2Alias;
		match.session.p1Avatar = match.session.p2Avatar;
		match.session.p2Alias = tempAlias;
		match.session.p2Avatar = tempAvatar;
	}
	addHUDs(match.session);
});

socket.on("countdown", (count: string) =>
{
	createSign(count);
	if (count === 'GO')
		setTimeout(() => {createSign();}, 500);
});

optionsButton(scene, cameras, [ball.material!, paddles.p1.material!, paddles.p2.material!]);

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', handleResize);

let roomString: string | null = sessionStorage.getItem('room');
if (!roomString)
{
	console.error("No Room Data Found! Redirecting to dashboard...");
	exitGame();
}
sessionStorage.removeItem('room');
let roomData: RoomData | null = null;
try { roomData = JSON.parse(roomString || 'null'); } catch {}
if (!roomData)
{
	console.error("Invalid Room Data! Redirecting to dashboard...");
	exitGame();
}
else
{
	socket.on("connect", async () =>
	{
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
			if (role !== 3)
			{
				modifyState(match.state);
				createSign(`WAITING FOR\nOPPONENT...`);
			}
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
		if (role === 3)
		{
			addHUDs(match.session);
			catchUpGoals(match.state.p1, match.state.p2);
		}
	});
}

const gameLoop = () =>
{
	const gameState = match.state;
	renderer.updateGameState(gameState);
	renderer.render();
	updateGoals(gameState.p1, gameState.p2);
	if (!(document.getElementById('game') as HTMLCanvasElement))
	{
		exitGame();
		return;
	}
	requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);