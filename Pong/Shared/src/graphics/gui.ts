import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/core/Meshes/meshBuilder";
import { GridMaterial } from "@babylonjs/materials";
import { Instance } from "../types";

const colIcon = ['/game/ball.svg', '/game/p1.svg', '/game/p2.svg'];
const camIcon = ['/game/cam1.svg', '/game/cam2.svg', '/game/cam3.svg', '/game/cam4.svg'];
const clicked = [false, false, false];

let ui:GUI.AdvancedDynamicTexture;
let options: boolean = false;
let camButtons: GUI.Button[] = [];
let colButtons: GUI.Button[] = [];
let picker: GUI.ColorPicker | null = null;

export function createGUI(): void {ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");}

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
	const button = GUI.Button.CreateImageOnlyButton('Options', '/game/options.svg');
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
	const hudSVG = player === 1 ? '/game/player1.svg' : '/game/player2.svg'
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
	// name.fontFamily = 'Press Start 2P'; // WiP
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

export function scoreGoal(player: number, goals: number)
{
	const horAllign = player === 1 ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	const goal = new GUI.Image('GOAL', '/game/goal.svg');
	goal.horizontalAlignment = horAllign;
	goal.verticalAlignment = GUI.Image.VERTICAL_ALIGNMENT_TOP;
	goal.height = '26px';
	goal.width = '26px';
	goal.top = '40px';
	goal.paddingBottom = 0;
	goal.paddingLeft = 0;
	goal.paddingRight = 0;
	goal.paddingTop = 0;
	let pos = 115 + (26 - 4.5) * goals + 4.5;
	if (player === 2)
		pos = -pos;
	goal.left = `${pos}px`;
	console.log(goal.left);
	ui.addControl(goal);
}
