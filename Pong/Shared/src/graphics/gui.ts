import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/core/Meshes/meshBuilder.js";
import { GridMaterial } from "@babylonjs/materials";
import { Instance } from "../types.js";
import { PongEngine } from "../game-engine.js";

const colIcon = ['/game/Assets/ball.svg', '/game/Assets/p1.svg', '/game/Assets/p2.svg'];
const camIcon = ['/game/Assets/cam1.svg', '/game/Assets/cam2.svg', '/game/Assets/cam3.svg', '/game/Assets/cam4.svg'];
const clicked = [false, false, false];
const FONT = 'Press Start 2P';

let ui:GUI.AdvancedDynamicTexture;
let options: boolean = false;
let camButtons: GUI.Button[] = [];
let colButtons: GUI.Button[] = [];
let picker: GUI.ColorPicker | null = null;
let signBox: GUI.Container | null = null;
let sign: GUI.Image | null = null;
let signText: GUI.TextBlock | null = null;
let p1Goals = 0;
let p2Goals = 0;

export function createGUI(): void {ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");}

export async function loadGameFont(): Promise<void> 
{
    try
	{
        await document.fonts.load(`16px ${FONT}`);
        await document.fonts.ready;
    }
	catch (e) {console.warn("Failed to preload Game Font:", e);}
}

function disposeButtons(): void
{
	for (let i = 0; i < colButtons.length; i++)
	{
		ui.removeControl(colButtons[i]);
		colButtons[i].dispose();
	}
	for (let i = 0; i < camButtons.length; i++)
	{
		ui.removeControl(camButtons[i]);
		camButtons[i].dispose();
	}
}

function cameraButtons(scene: BABYLON.Scene, cameras : { [key: string]: BABYLON.Camera }): void
{
	for (let i = 0; i < 4; i++)
	{
		camButtons[i] = GUI.Button.CreateImageOnlyButton('Camera', camIcon[i]);
		camButtons[i].thickness = 0;
		camButtons[i].width = "50px";
		camButtons[i].height = "50px";
		camButtons[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		camButtons[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		camButtons[i].top = "225px";
		camButtons[i].left = `${(-15 - 50) * i - 15}px`;
		ui.addControl(camButtons[i]);
		camButtons[i].onPointerClickObservable.add(function()
		{
			if (picker)
			{
				ui.removeControl(picker);
				picker.dispose();
				picker = null;
				clicked.fill(false);
			}
			scene.activeCamera = cameras[`${i + 1}`];
		});
	}
}

function colorButtons(mesh: BABYLON.Material[]): void
{
	for (let i = 0; i < 3; i++)
	{
		colButtons[i] = GUI.Button.CreateImageOnlyButton('GridColor', colIcon[i]);
		colButtons[i].thickness = 0;
		colButtons[i].width = "50px";
		colButtons[i].height = "50px";
		colButtons[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		colButtons[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		colButtons[i].top = "290px";
		colButtons[i].left = `${(-15 - 50) * i - 15}px`;
		ui.addControl(colButtons[i]);
		colButtons[i].onPointerClickObservable.add(function()
		{
			if (picker)
			{
				ui.removeControl(picker);
				picker.dispose();
				picker = null;
				if (clicked[i])
				{
					clicked[i] = false;
					return ;
				}
			}
			clicked.fill(false);
			clicked[i] = true;
			picker = new GUI.ColorPicker('GridColorPicker');
			picker.width = "150px";
			picker.height = "150px";
			picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			picker.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
			picker.top = "360px";
			picker.left = `${-30 * i}px`;
			const tmp = mesh[i] as GridMaterial;
			picker.onValueChangedObservable.add(function(value) {tmp.lineColor = value;})
			ui.addControl(picker);
		})
	}
}

export function optionsButton(scene: BABYLON.Scene, cameras : { [key: string]: BABYLON.Camera }, mesh: BABYLON.Material[]): void
{
	const button = GUI.Button.CreateImageOnlyButton('Options', '/game/Assets/options.svg');
	button.thickness = 0;
	button.width = '50px';
	button.height = '50px';
	button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	button.top = "160px";
	button.left = "-15px";
	ui.addControl(button);
	button.onPointerClickObservable.add(function()
	{
		if (!options)
		{
			cameraButtons(scene, cameras);
			colorButtons(mesh);
			options = true;
		}
		else
		{
			if (picker)
			{
				ui.removeControl(picker);
				picker.dispose();
				picker = null;
				clicked.fill(false);
			}
			disposeButtons();
			options = false;
		}
	});
}

function createHUD(player: number, alias: string): GUI.Image
{
	const hudSVG = player === 1 ? '/game/Assets/player1.svg' : '/game/Assets/player2.svg'
	const horAllign = player === 1 ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	const hud = new GUI.Image(alias + 'HUD', hudSVG);
	hud.horizontalAlignment = horAllign;
	hud.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	hud.width = `${(998.74 * 40) / 100}px`;
	hud.height = `${(311.07 * 40) / 100}px`;
	hud.top = "10px";
	hud.left = player === 1 ? "10px" : "-10px";
	return hud;
}

function createFrame(player: number, alias: string, avatar: string): GUI.Ellipse
{
	const horAllign = player === 1 ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	const frame = new GUI.Ellipse();
	frame.height = "110px";
	frame.width = "110px";
	frame.thickness = 0;
	frame.horizontalAlignment = horAllign;
	frame.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	frame.top = "17px";
	frame.left = player === 1 ? "17px" : "-17px";
	const pic = new GUI.Image(alias + 'Avatar', avatar);
	pic.width = '100%';
	pic.height = '100%';
	frame.addControl(pic);
	return frame;
}

function createAlias(player : number, alias: string): GUI.TextBlock
{
	const horAllign = player === 1 ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	const name = new GUI.TextBlock(alias, alias);
	name.horizontalAlignment = horAllign;
	name.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	// name.fontFamily = FONT; // WiP
	name.fontSize = 42;
	name.fontStyle = 'bold';
	name.resizeToFit = true;
	name.color = '#ED6F30';
	name.outlineColor = '#000000';
	name.outlineWidth = 3;
	name.top = "73px";
	name.left = player === 1 ? "140px" : "-140px";
	return name;
}

export function addHUDs(session: Instance): void
{
	const p1HUD = createHUD(1, session.p1Alias);
	const p1Frame = createFrame(1, session.p1Alias, session.p1Avatar);
	const p1Name = createAlias(1, session.p1Alias);
	ui.addControl(p1HUD);
	ui.addControl(p1Name);
	ui.addControl(p1Frame);
	const p2HUD = createHUD(2, session.p2Alias);
	const p2Frame = createFrame(2, session.p2Alias, session.p2Avatar);
	const p2Name = createAlias(2, session.p2Alias);
	ui.addControl(p2HUD);
	ui.addControl(p2Name);
	ui.addControl(p2Frame);
}

function newGoal(player: number): GUI.Image
{
	const horAllign = player === 1 ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	const goal = new GUI.Image('GOAL', '/game/Assets/goal.svg');
	goal.horizontalAlignment = horAllign;
	goal.verticalAlignment = GUI.Image.VERTICAL_ALIGNMENT_TOP;
	goal.height = '26px';
	goal.width = '26px';
	goal.top = '40px';
	goal.paddingBottom = 0;
	goal.paddingLeft = 0;
	goal.paddingRight = 0;
	goal.paddingTop = 0;
	return goal;
}

export function updateGoals(player1: number, player2: number)
{
	if (player1 > p1Goals)
	{
		p1Goals++;
		const goal = newGoal(1);
		let pos = 115 + (26 - 4.5) * p1Goals + 4.5;
		goal.left = `${pos}px`;
		ui.addControl(goal);
	}
	if (player2 > p2Goals)
	{
		p2Goals++;
		const goal = newGoal(2);
		let pos = - (115 + (26 - 4.5) * p2Goals + 4.5);
		goal.left = `${pos}px`;
		ui.addControl(goal);
	}
}

export function catchUpGoals(player1: number, player2: number): void
{
	while (p1Goals < player1 || p2Goals < player2)
		updateGoals(player1, player2);
}

export function startButton(engine: PongEngine): void
{
	const button = GUI.Button.CreateImageWithCenterTextButton('Start', 'READY?', '/game/Assets/button.svg');
	button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	button.width = '20%';
	button.height = '20%';
	button.top = '15%';
	button.thickness = 0;
	if (button.textBlock)
	{
		button.textBlock.fontSize = 48;
		button.textBlock.fontStyle = 'bold italic';
		// button.textBlock.fontFamily = FONT; // WiP
		button.textBlock.color = '#ED6F30';
		button.textBlock.outlineColor = '#000000';
	}
	ui.addControl(button);

	button.onPointerClickObservable.add(async () =>
	{
		ui.removeControl(button);
		button.dispose();
		createSign('GET READY');
		await new Promise(resolve => setTimeout(resolve, 1000));
		engine.setState('Countdown');
		for (let count = 3; count > 0; count--)
		{
			createSign(`${count}`);
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		createSign('GO');
		engine.setState('Playing');
		setTimeout(() => {createSign();}, 500);
	});
}

export function createSign(text?: string): void
{
	if (!text)
	{
		if (signText)
		{
			signBox?.removeControl(signText);
			signText.dispose();
			signText = null;
		}
		if (sign)
		{
			signBox?.removeControl(sign);
			sign.dispose();
			sign = null;
		}
		if (signBox)
		{
			ui.removeControl(signBox);
			signBox.dispose();
			signBox = null;
		}
		return ;
	}

	const fontSize = text.length < 3 ? 70 : 48;

	if (signText)
	{
		signText.text = text;
		signText.fontSize = fontSize;
		return ;
	}
	
	signBox = new GUI.Container("BOX");
    signBox.adaptHeightToChildren = true;
    signBox.adaptWidthToChildren = true;

	signText = new GUI.TextBlock('SignText', text);
	signText.fontSize = fontSize;
	signText.fontStyle = 'bold';
	signText.color = '#ED6F30';
	// signText.outlineWidth = 0;
	signText.resizeToFit = true;
	signText.paddingLeft = "40px";
	signText.paddingRight = "40px";
	signText.paddingTop = "20px";
	signText.paddingBottom = "20px";

	sign = new GUI.Image('Sign', '/game/Assets/sign.svg');
	sign.stretch = GUI.Image.STRETCH_FILL;
	signBox.addControl(sign);
	signBox.addControl(signText);
	ui.addControl(signBox);
}
