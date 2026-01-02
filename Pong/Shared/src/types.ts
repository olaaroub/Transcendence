export type Input	= -1 | 0 | 1;
export type State	= "Waiting" | "Countdown" | "Playing" | "Over";
export type Diff	= "None" | "Easy" | "Normal" | "Hard";

export interface Instance
{
	oppAI:		boolean;
	diff:		Diff;
	p1Alias:	string;
	p1Avatar:	string;
	p2Alias:	string;
	p2Avatar:	string;
}

export interface AI
{
	diff:		number;
	target:		number;
}

export interface GameState
{
	p1:			number;
	p2:			number;
	p1Input:	Input;
	p2Input:	Input;
	p1X:		number;
	p1Y:		number;
	p2X:		number;
	p2Y:		number;
	ballX:		number;
	ballY:		number;
	ballS:		number;
}

export interface Match
{
	state:		GameState;
	currState:	State;
	session:	Instance;
}

export interface RoomData
{
	roomId:			string;
	PlayerID:		string;
	playerName: 	string;
	playerAvatar:	string;
}
