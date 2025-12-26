import { Input, Diff, State } from './types.js';

const i = 1;

export const WIDTH = 640 * i;
export const HEIGHT = 480 * i;
export const PWIDTH = 20 * i;
export const PHEIGHT = 80 * i;
export const PSPEED = 400;
export const BSPEED = 300;
export const BRADIUS = 10 * i;
export const ULGAP = 5;
export const DRGAP = HEIGHT - PHEIGHT - 5;
export const PORT = 3000;
export const TICKRATE = 60;
export const TICKDT = 1 / TICKRATE;

export const keyMap: { [key: string]: { player: "p1Input" | "p2Input"; value: Input } } =
{
	w:			{ player: "p1Input", value: -1 },
	a:			{ player: "p1Input", value: -1 },
	s:			{ player: "p1Input", value:  1 },
	d:			{ player: "p1Input", value:  1 },
	ArrowUp:	{ player: "p2Input", value: -1 },
	ArrowLeft:	{ player: "p2Input", value: -1 },
	ArrowDown:	{ player: "p2Input", value:  1 },
	ArrowRight:	{ player: "p2Input", value:  1 },
};

export const diffMap: { [key in Diff]: number } = { None: 0, Easy: 2, Normal: 4, Hard: 8 };

export const stateMap: { [key in State]: string } =
{
	"Error":	"INVALID SESSION",
	"Open":		"PRESS ANY KEY TO START",
	"Over":		"GAME OVER",
	"Playing":	"N/A"
};
