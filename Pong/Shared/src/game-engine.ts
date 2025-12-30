import { GameState, Input, Instance, AI, State, Diff } from './types.js';
import { WIDTH, HEIGHT, PWIDTH, PHEIGHT, PSPEED, BSPEED, BRADIUS, ULGAP, DRGAP, TICKDT, diffMap } from './constants.js';
import { scoreGoal } from './graphics/gui.js';

export class PongEngine
{
	private state: GameState;
	private currentState: State = 'Open';
	private currentTick: number = 0;
	private lastGoal: -1 | 1 = 1;
	private ballVX: number = 0;
	private ballVY: number = 0;
	private session: Instance;
	private aiInstance: AI = { diff: 0, target: HEIGHT / 2 };
	private winner: string = '';

	constructor(session?: Instance)
	{
		this.session = session || this.getSessionStorage();
		this.state =
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
		};
		if (this.session.oppAI)
			this.aiInstance.diff = diffMap[this.session.diff];
		this.resetBall();
	}

	getState(): GameState {return { ...this.state };}

	getCurrentState(): State {return this.currentState;}

	getCurrentTick(): number {return this.currentTick;}

	getSession(): Instance {return this.session}

	getWinner(): string {return this.winner;}

	setInput(player: 1 | 2, input: Input): void
	{
		player === 1 ? this.state.p1Input = input : this.state.p2Input = input;
		if (this.currentState === 'Open' && input !== 0)
			this.setState('Playing');
	}

	private getSessionStorage(): Instance
	{
		const sessionData = sessionStorage.getItem('gameSession');
		if (sessionData)
		{
			sessionStorage.removeItem('gameSession');
			const session = JSON.parse(sessionData);
			if (session)
			{
				const ret: Instance = session;
				if (ret)
					return ret;
			}
		}
		console.warn('No session data found, using default session.');
		return {
			oppAI: false,
			diff: 'None',
			p1Alias: 'Player 1',
			p1Avatar: 'default.png',
			p2Alias: 'Player 2',
			p2Avatar: 'default.png'
		};
	}

	setSessionAI(oppAI: boolean, diff: Diff): void
	{
		this.session.oppAI = oppAI;
		this.session.diff = diff;
		if (oppAI)
			this.aiInstance.diff = diffMap[diff];
	}

	private resetBall(): void
	{
		this.state.ballX = WIDTH / 2;
		this.state.ballY = HEIGHT / 2;
		this.state.ballS = BSPEED;
		if (this.currentState === 'Playing')
		{
			const angle = (Math.random() - 0.5) * 0.6;
			this.ballVX = Math.cos(angle) * this.state.ballS * this.lastGoal;
			this.ballVY = Math.sin(angle) * this.state.ballS;
			return;
		}
		this.ballVX = 0;
		this.ballVY = 0;
	}

	private setState(newState: State): void
	{
		this.currentState = newState;
		console.log(`State Changed To: ${this.currentState}`);
		this.resetBall();
	}

	private refreshAIView(): void
	{
		if (this.currentTick % 60 === 0)
		{
			let predictedY: number;
			let nextCollision: number;
			if (this.ballVX < 0)
				nextCollision = (this.state.p2X + PWIDTH - this.state.ballX) / this.ballVX;
			else
				nextCollision = (this.state.p1X - this.state.ballX) / this.ballVX;
			predictedY = this.state.ballY + this.ballVY * nextCollision;
			while (predictedY < BRADIUS || predictedY > HEIGHT - BRADIUS)
			{
				if (predictedY < BRADIUS)
					predictedY = BRADIUS + (BRADIUS - predictedY);
				else if (predictedY > HEIGHT - BRADIUS)
					predictedY = HEIGHT - BRADIUS - (predictedY - (HEIGHT - BRADIUS));
			}
			this.aiInstance.target = predictedY;
		}
		const i: number = Math.floor(Math.random() * 8) + 1;
		let p2C: number = this.state.p2Y + PHEIGHT / 2;
		this.state.p2Input = 0;
		if (Math.abs(p2C - this.aiInstance.target) > 5)
		{
			if (i % this.aiInstance.diff === 0)
			{
				if (Math.random() < 0.5)
					this.state.p2Input = 0;
				else
					p2C < this.aiInstance.target ? (this.state.p2Input = -1) : (this.state.p2Input = 1);
			}
			else
				p2C < this.aiInstance.target ? (this.state.p2Input = 1) : (this.state.p2Input = -1);
		}
	}

	private registerInput(): void
	{
		if (this.state.p1Input)
		{
			const delta = this.state.p1Input * (PSPEED * TICKDT);
			this.state.p1Y = Math.max(ULGAP, Math.min(this.state.p1Y + delta, DRGAP));
		}
		if (this.state.p2Input)
		{
			const delta = this.state.p2Input * (PSPEED * TICKDT);
			this.state.p2Y = Math.max(ULGAP, Math.min(this.state.p2Y + delta, DRGAP));
		}
	}

	private pCollision(pX: number, pY: number): boolean {
		const dx = this.state.ballX - Math.max(pX, Math.min(pX + PWIDTH, this.state.ballX));
		const dy = this.state.ballY - Math.max(pY, Math.min(pY + PHEIGHT, this.state.ballY));
		const dist2 = dx * dx + dy * dy;
		if (dist2 <= BRADIUS * BRADIUS)
		{
			const dist = Math.sqrt(dist2) || 0.0001;
			const nx = dx / dist;
			const ny = dy / dist;
			const penetration = BRADIUS - dist;
			this.state.ballX += nx * (penetration + 0.1);
			this.state.ballY += ny * (penetration + 0.1);
			const dot = this.ballVX * nx + this.ballVY * ny;
			this.ballVX = this.ballVX - 2 * dot * nx;
			this.ballVY = this.ballVY - 2 * dot * ny;
			const paddleCenterY = pY + PHEIGHT * 0.5;
			const rel = (this.state.ballY - paddleCenterY) / (PHEIGHT * 0.5);
			this.ballVY += rel * 60;
			const maxAngleRad = (70 * Math.PI) / 180;
			const S = this.state.ballS;
			const maxVy = Math.sin(maxAngleRad) * S;
			if (Math.abs(this.ballVY) > maxVy)
			{
				const vySign = Math.sign(this.ballVY) || 1;
				this.ballVY = vySign * maxVy;
				const tmp = S * S - this.ballVY * this.ballVY;
				const safe = tmp > 0 ? Math.sqrt(tmp) : 0.0001;
				const vxSign = Math.sign(this.ballVX) || 1;
				this.ballVX = vxSign * safe;
			}
			else
			{
				const curSpeed = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY) || 0.0001;
				this.ballVX = (this.ballVX / curSpeed) * S;
				this.ballVY = (this.ballVY / curSpeed) * S;
			}
			return true;
		}
		return false;
	}

	private goal(): void
	{
		if (this.state.ballX < -BRADIUS)
		{
			this.state.p1++;
			this.lastGoal = 1;
			scoreGoal(1, this.state.p1);
		}
		else if (this.state.ballX > WIDTH + BRADIUS)
		{
			this.state.p2++;
			this.lastGoal = -1;
			scoreGoal(2, this.state.p2);
		}
		if (this.state.p1 === 5 || this.state.p2 === 5)
		{
			this.winner = this.state.p1 === 5 ? this.session.p1Alias : this.session.p2Alias;
			this.setState('Over');
		}
		this.resetBall();
	}

	tick(): void
	{
		this.currentTick++;
		if (this.currentState !== 'Playing')
			return;
		if (this.session.oppAI)
			this.refreshAIView();
		this.registerInput();
		const maxMove = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY) * TICKDT;
		const stepThreshold = BRADIUS * 0.6;
		let steps = 1;
		if (maxMove > stepThreshold)
			steps = Math.ceil(maxMove / stepThreshold);
		steps = Math.min(steps, 8);
		const subDT = TICKDT / steps;
		for (let s = 0; s < steps; s++)
		{
			this.state.ballX += this.ballVX * subDT;
			this.state.ballY += this.ballVY * subDT;
			if (this.state.ballY - BRADIUS <= 0)
			{
				this.state.ballY = BRADIUS;
				this.ballVY = -this.ballVY;
			}
			else if (this.state.ballY + BRADIUS >= HEIGHT)
			{
				this.state.ballY = HEIGHT - BRADIUS;
				this.ballVY = -this.ballVY;
			}
			if (this.pCollision(this.state.p1X, this.state.p1Y) || this.pCollision(this.state.p2X, this.state.p2Y))
				this.state.ballS = Math.min(this.state.ballS + 50, 800);
		}
		if (this.state.ballX < -BRADIUS || this.state.ballX > WIDTH + BRADIUS) {
			this.goal();
		}
	}
}
