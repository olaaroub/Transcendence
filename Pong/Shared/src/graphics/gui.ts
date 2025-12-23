import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/core/Meshes/meshBuilder";
import { GridMaterial } from "@babylonjs/materials";

export function createGUI(): GUI.AdvancedDynamicTexture
{
	const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	ui.renderAtIdealSize = true;
	return ui;
}

const colIcon = ['ball.svg', 'p1.svg', 'p2.svg'];
const camIcon = ['cam1.svg', 'cam2.svg', 'cam3.svg', 'cam4.svg'];
const clicked = [false, false, false];

let options: boolean = false;
let camButtons: GUI.Button[] = [];
let colButtons: GUI.Button[] = [];
let picker: GUI.ColorPicker | null = null;

function disposeButtons(ui: GUI.AdvancedDynamicTexture): void
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

function cameraButtons(ui: GUI.AdvancedDynamicTexture, scene: BABYLON.Scene, cameras : { [key: string]: BABYLON.Camera }): void
{
	for (let i = 0; i < 4; i++)
	{
		camButtons[i] = GUI.Button.CreateImageOnlyButton('Camera', camIcon[i]);
		camButtons[i].thickness = 0;
		camButtons[i].width = "50px";
		camButtons[i].height = "50px";
		camButtons[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		camButtons[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		camButtons[i].top = "80px";
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

function colorButtons(ui: GUI.AdvancedDynamicTexture, mesh: GridMaterial[]): void
{
	for (let i = 0; i < 3; i++)
	{
		colButtons[i] = GUI.Button.CreateImageOnlyButton('GridColor', colIcon[i]);
		colButtons[i].thickness = 0;
		colButtons[i].width = "50px";
		colButtons[i].height = "50px";
		colButtons[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		colButtons[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		colButtons[i].top = "145px";
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
			picker.top = "215px";
			picker.left = `${-30 * i}px`;
			picker.onValueChangedObservable.add(function(value) {mesh[i].lineColor = value;})
			ui.addControl(picker);
		})
	}
}

export function optionsButton(ui: GUI.AdvancedDynamicTexture, scene: BABYLON.Scene, cameras : { [key: string]: BABYLON.Camera }, mesh: GridMaterial[]): void
{
	const button = GUI.Button.CreateImageOnlyButton('Options', 'options.svg');
	button.thickness = 0;
	button.width = '50px';
	button.height = '50px';
	button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	button.top = "15px";
	button.left = "-15px";
	ui.addControl(button);
	button.onPointerClickObservable.add(function()
	{
		if (!options)
		{
			cameraButtons(ui, scene, cameras);
			colorButtons(ui, mesh);
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
			disposeButtons(ui);
			options = false;
		}
	});
}
