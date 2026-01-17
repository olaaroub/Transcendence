import Fastify, { FastifyBaseLogger } from 'fastify';
import FastifyJwt from '@fastify/jwt';
import Vault from 'node-vault';
import fastifyMetrics from 'fastify-metrics';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
	PongEngine,
	Match,
	RoomData,
	Input,
	Instance,
	TICKDT,
} from 'pong-shared';

interface RoomMember
{
	socket:	Socket;
	userID:	string;
	side:	1 | 2 | 3;
}

interface Player
{
	userID:	string;
	win:	boolean;
	scored:	number;
}

interface GameRoom
{
	id:			string;
	engine:		PongEngine;
	members:	Map<string, RoomMember>;
	tick:		NodeJS.Timeout | null;
	session:	Instance;
}

const HOST = process.env.HOST as string;
const PORT = Number(process.env.PORT) || 3005;

const ext = process.env.SERVICE_EXT || '-prod';
const USER_SERVICE_URL = `http://user-service${ext}:3002`;

const rooms = new Map<string, GameRoom>();
const matchmakingQueue: string[] = [];
const connectedUsers = new Map<string, Socket>();
const pendingUsers = new Set<string>();

declare module 'fastify' { interface FastifyInstance { customMetrics: { matchCounter: any; } } }

async function getSecrets(logger: FastifyBaseLogger)
{
	try
	{
		const vaultPath = process.env.VAULT_SECRET_PATH as string;
		const options =
		{
			apiVersion: 'v1',
			endpoint: process.env.VAULT_ADDR,
			token: process.env.PONG_SERVICE_TOKEN
		};

		const vaultClient = Vault(options);
		logger.info(`reading secrets from: ${vaultPath}`);
		const { data } = await vaultClient.read(vaultPath);

		return { jwtSecret: data.data.jwt_secret };
	}
	catch (err)
	{
		logger.error({ msg: "CRITICAL: Error fetching secret from Vault", err: err });
		process.exit(1);
	}
}

const fastify = Fastify(
{
	logger:
	{
		level: process.env.LOG_LEVEL || 'info',
		base:
		{
			service_name: 'pong-game',
			environment: process.env.NODE_ENV || 'development'
		},
		redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password']
	}
});

await fastify.register(fastifyMetrics as any,
{
	endpoint: '/metrics',
	defaultMetrics: { enabled: true }
});

const matchCounter = new fastify.metrics.client.Counter(
{
	name: 'matches_total',
	help: 'Total number of Matches Started'
});


fastify.decorate('customMetrics', { matchCounter });

let io: SocketIOServer;

// =============================================================================
// ROOM MANAGEMENT
// =============================================================================

function generateRoomId(): string
{
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < 5; i++)
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	if (rooms.has(result))
		return generateRoomId();
	return result;
}

function createGameRoom(roomId: string): GameRoom
{
	const session: Instance =
	{
		oppAI: false,
		diff: 'None',
		p1Alias: 'Player 1',
		p1Avatar: '/game/Assets/default.png',
		p2Alias: 'Player 2',
		p2Avatar: '/game/Assets/default.png',
	};
	const p1: Player =
	{
		userID:	'',
		win: false,
		scored: 0
	}
	const p2: Player =
	{
		userID:	'',
		win: false,
		scored: 0
	}
	const engine = new PongEngine(session);
	return {
		id: roomId,
		engine,
		members: new Map(),
		tick: null,
		session,
	};
}

function getAvailableSide(room: GameRoom): 1 | 2 | 3
{
	const sides = new Set<number>();
	for (const member of room.members.values())
		if (member.side !== 3)
			sides.add(member.side);
	if (!sides.has(1))
		return 1;
	if (!sides.has(2))
		return 2;
	return 3;
}

function getPlayerCount(room: GameRoom): number
{
	let count = 0;
	for (const member of room.members.values())
		if (member.side !== 3)
			count++;
	return count;
}

function broadcastToRoom(roomId: string, event: string, data?: unknown): void {io.to(roomId).emit(event, data);}

function getMatchData(room: GameRoom): Match
{
	return {
		state: room.engine.getState(),
		currState: room.engine.getCurrentState(),
		session: room.session,
	};
}

function getIDBySide(members: Map<string, RoomMember>, side: 1 | 2): string
{
	for (const member of members.values())
	{
		if (member.side === side)
			return member.userID;
	}
	return '';
}

async function startCountdown(room: GameRoom): Promise<void>
{
	room.engine.setState('Countdown');
	broadcastToRoom(room.id, 'gamestate', 'Countdown');
	broadcastToRoom(room.id, 'countdown', 'GET READY!');
	await new Promise((resolve) => setTimeout(resolve, 2000));
	for (let count = 3; count >= 0; count--)
	{
		if (count === 0)
			broadcastToRoom(room.id, 'countdown', 'GO');
		else
			broadcastToRoom(room.id, 'countdown', `${count}`);
		if (count > 0)
			await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	room.engine.setState('Playing');
	broadcastToRoom(room.id, 'gamestate', 'Playing');
	startGameLoop(room);
}

function startGameLoop(room: GameRoom): void
{
	if (room.tick)
		clearInterval(room.tick);
	room.tick = setInterval(() =>
	{
		if (room.engine.getCurrentState() !== 'Playing')
			return;
		room.engine.tick();
		const state = room.engine.getState();
		broadcastToRoom(room.id, 'state', state);
		if (room.engine.getCurrentState() === 'Over')
			handleGameOver(room);
	}, Math.round(TICKDT * 1000));
}

function handleGameOver(room: GameRoom, disconnectedSide?: 1 | 2): void
{
	room.engine.setState('Over');
	if (room.tick)
	{
		clearInterval(room.tick);
		room.tick = null;
	}
	let winner: string;
	if (disconnectedSide)
		winner = disconnectedSide === 1 ? room.session.p2Alias : room.session.p1Alias;
	else
		winner = room.engine.getWinner();
	broadcastToRoom(room.id, 'gamestate', 'Over');
	broadcastToRoom(room.id, 'gameOver', winner);
	sendGameResults(room);
	setTimeout(() => {broadcastToRoom(room.id, 'redirect');}, 5000);
}

async function sendGameResults(room: GameRoom): Promise<Response>
{
	const player1 = getIDBySide(room.members, 1);
	const player2 = getIDBySide(room.members, 2);
	const p1: Player =
	{
		userID: player1,
		win: room.engine.getWinner() === room.session.p1Alias ? true : false ,
		scored: room.engine.getState().p1
	}
	const p2: Player =
	{
		userID: player2,
		win: p1.win ? false : true,
		scored: room.engine.getState().p2
	}
	fastify.log.info(`Room ${room.id} Results Prepared. Sending to Database...`);
	const resp = await fetch(`${USER_SERVICE_URL}/api/user/match/result`,
		{
			method: "PUT",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({p1, p2}),
		})
	fastify.log.info(`Room ${room.id} Results Acknowledged by Database...`);
	return resp;
}

function cleanupRoom(roomId: string): void
{
	const room = rooms.get(roomId);
	if (!room)
		return;
	if (room.members.size === 0)
	{
		if (room.tick)
			clearInterval(room.tick);
		rooms.delete(roomId);

		const queueIndex = matchmakingQueue.indexOf(roomId);
		if (queueIndex !== -1)
			matchmakingQueue.splice(queueIndex, 1);
		fastify.log.info(`Room ${roomId} cleaned up`);
	}
}

// =============================================================================
// REST API ROUTES
// =============================================================================

async function jwtChecker(request: any, reply: any)
{
	try
	{
		const payload = await request.jwtVerify();
		const userId = String(payload.id);
		if (connectedUsers.has(userId) || pendingUsers.has(userId))
			throw new Error('User Already Connected!');
		request.userId = userId;
	}
	catch (err) {reply.status(401).send({ message: 'Unauthorized' });}
}

fastify.get('/api/game/matchmaking', {preHandler: [jwtChecker]} ,async (request: any, reply) =>
{
	let roomId: string;
	const userId = request.userId as string;
	pendingUsers.add(userId);

	if (matchmakingQueue.length > 0)
	{
		roomId = matchmakingQueue.shift()!;
		fastify.log.info(`Matchmaking: Returning existing room ${roomId}`);
	}
	else
	{
		roomId = generateRoomId();
		const room = createGameRoom(roomId);
		rooms.set(roomId, room);
		matchmakingQueue.push(roomId);
		fastify.log.info(`Matchmaking: Created new room ${roomId}`);
	}
	return reply.send({ roomId });
});

fastify.get('/api/game/friendly-match', {preHandler: [jwtChecker]} ,async (request: any, reply) =>
{
	const userId = request.userId as string;
	pendingUsers.add(userId);
	const roomId: string = generateRoomId();
	const room = createGameRoom(roomId);
	rooms.set(roomId, room);
	fastify.log.info(`Friendly Match: Created new room ${roomId}`);
	return reply.send({ roomId });
});

fastify.get<{ Params: { roomid: string } }>('/api/game/room/:roomid', {preHandler: [jwtChecker]}, async (request, reply) =>
{
	const { roomid } = request.params;
	const exists = rooms.has(roomid.toUpperCase());
	return reply.send({ exists });
});

fastify.get('/api/game/spectate', {preHandler: [jwtChecker]} ,async (request, reply) =>
{
	const roomIDs = Array.from(rooms.entries())
		.filter(([_, room]) => getPlayerCount(room) > 1)
		.map(([roomId, _]) => roomId);

	if (roomIDs.length > 0)
	{
		const roomId = roomIDs[Math.floor(Math.random() * roomIDs.length)];
		fastify.log.info(`Spectate: Returning room ${roomId}`);
		return reply.send({ roomId });
	}
	fastify.log.info(`Spectate: No rooms found`);
	return reply.send({ roomId: null });
});

// =============================================================================
// SOCKET.IO EVENT HANDLERS
// =============================================================================

function initSocketHandlers(): void
{
	io.on('connection', (socket: Socket) =>
	{
		fastify.log.info(`Socket connected: ${socket.id}`);

		let currentRoomId: string | null = null;
		let playerSide: 1 | 2 | 3 = 3;
		let userID: string = '';

		socket.on('match', (data: RoomData, callback: (response: Match | null) => void) =>
		{
			const roomId = data.roomId.toUpperCase();
			const room = rooms.get(roomId);

			if (!room)
			{
				fastify.log.warn(`Room ${roomId} Not Found!`);
				callback(null);
				return;
			}

			currentRoomId = roomId;
			socket.join(roomId);
			playerSide = getAvailableSide(room);
			room.members.set(socket.id, { socket, userID: data.PlayerID, side: playerSide });
			userID = data.PlayerID;
			pendingUsers.delete(data.PlayerID);
			connectedUsers.set(data.PlayerID, socket);
			socket.emit('side', playerSide);

			if (playerSide !== 3)
			{
				if (playerSide === 1)
				{
					room.session.p1Alias = data.playerName || 'Player 1';
					room.session.p1Avatar = data.playerAvatar || '/game/Assets/default.png';
				}
				else
				{
					room.session.p2Alias = data.playerName || 'Player 2';
					room.session.p2Avatar = data.playerAvatar || '/game/Assets/default.png';
				}
				fastify.log.info(`Player ${data.playerName} joined room ${roomId} as P${playerSide}`);

				if (getPlayerCount(room) === 2 && room.engine.getCurrentState() === 'Waiting')
				{
					broadcastToRoom(roomId, 'session', room.session);
					const queueIndex = matchmakingQueue.indexOf(roomId);
					if (queueIndex !== -1)
						matchmakingQueue.splice(queueIndex, 1);
					fastify.customMetrics.matchCounter.inc();
					startCountdown(room);
				}
			}
			else
			{
				fastify.log.info(`Spectator ${socket.id} joined room ${roomId}`);
				socket.emit('session', room.session);
			}
			callback(getMatchData(room));
		});

		socket.on('input', (input: Input) =>
		{
			if (!currentRoomId || playerSide === 3)
				return;
			const room = rooms.get(currentRoomId);
			if (!room || room.engine.getCurrentState() !== 'Playing')
				return;
			room.engine.setInput(playerSide, input);
		});

		socket.on('disconnect', () =>
		{
			fastify.log.info(`Socket disconnected: ${socket.id}`);
			if (!currentRoomId)
				return;
			const room = rooms.get(currentRoomId);
			if (!room)
				return;
			if (connectedUsers.get(userID) === socket)
            	connectedUsers.delete(userID);
			const member = room.members.get(socket.id);
			room.members.delete(socket.id);

			if (member && member.side !== 3)
			{
				if (room.engine.getCurrentState() === 'Playing' || room.engine.getCurrentState() === 'Countdown')
					handleGameOver(room, member.side);
			}
			cleanupRoom(currentRoomId);
		});
	});
}

// =============================================================================
// START SERVER
// =============================================================================

const start = async () =>
{
	try
	{
		fastify.log.info(`Starting Pong Game Server...`);
		const secrets = await getSecrets(fastify.log) as { jwtSecret: string };
		fastify.log.debug(`Secrets fetched successfully: ${secrets.jwtSecret}`);
		await fastify.register(FastifyJwt, { secret: secrets.jwtSecret });
		await fastify.listen({ host: HOST, port: PORT });
		io = new SocketIOServer(fastify.server,
		{
			path: '/api/game/socket.io/',
			cors:
			{
				origin: '*',
				methods: ['GET', 'POST']
			}
		});
		initSocketHandlers();
		fastify.log.info(`Pong Server Running On: http://${HOST}:${PORT}`);
	}
	catch (err)
	{
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
