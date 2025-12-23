export type Input = -1 | 0 | 1;
export type State = "Error" | "Open" | "Playing" | "Over";
export type Diff = "None" | "Easy" | "Normal" | "Hard";

export interface Instance
{
	oppAI: boolean;
	diff: Diff;
	p1Alias: string;
	p2Alias: string;
}

export interface AI
{
	diff: number;
	target: number;
}

export interface GameState
{
	p1: number;
	p2: number;
	p1Input: Input;
	p2Input: Input;
	p1X: number;
	p1Y: number;
	p2X: number;
	p2Y: number;
	ballX: number;
	ballY: number;
	ballS: number;
}
