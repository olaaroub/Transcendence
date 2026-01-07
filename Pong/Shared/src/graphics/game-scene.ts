import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Meshes/meshBuilder.js";
import { PongLoading } from "./renderer.js";

export interface GameScene
{
	engine: BABYLON.Engine;
	scene: BABYLON.Scene;
	cameras: { [key: string]: BABYLON.Camera };
}

export function createScene(canvas: HTMLCanvasElement): GameScene
{
	const engine = new BABYLON.Engine(canvas, true);
	const scene = new BABYLON.Scene(engine);
	engine.loadingScreen = new PongLoading();
	engine.displayLoadingUI();

	const light = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(5, -10, 5), scene);
	light.diffuse = BABYLON.Color3.FromHexString("#ED6F30");
	light.intensity = 1;
	const light3 = new BABYLON.DirectionalLight("Sun2", new BABYLON.Vector3(-5, -10, -5), scene);
	light3.diffuse = BABYLON.Color3.FromHexString("#ED6F30");
	light3.intensity = 1;
	const light2 = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 10, 0), scene);
	light2.diffuse = BABYLON.Color3.FromHexString("#ED6F30");
	light2.intensity = 1;

	const cam1 = new BABYLON.FreeCamera('Classic', new BABYLON.Vector3(0, 600, 0), scene);
	cam1.setTarget(BABYLON.Vector3.Zero());
	const cam2 = new BABYLON.FreeCamera('Pilot', new BABYLON.Vector3(600, 500, 0), scene);
	cam2.setTarget(BABYLON.Vector3.Zero());
	const cam3 = new BABYLON.FreeCamera('Spectator', new BABYLON.Vector3(0, 450, 450), scene);
	cam3.setTarget(BABYLON.Vector3.Zero());
	const cam4 = new BABYLON.ArcRotateCamera('FreeCam', 0, 0, 45, new BABYLON.Vector3(0, 600, 600), scene);
	cam4.setTarget(BABYLON.Vector3.Zero());
	cam4.attachControl(canvas, true);
	cam4.keysUp = [];
	cam4.keysDown = [];
	cam4.keysLeft = [];
	cam4.keysRight = [];
	cam4.speed = 20;
	cam4.upperBetaLimit = Math.PI / 2.4;

	const cameras: { [key: string]: BABYLON.Camera } = { 1: cam1, 2: cam2, 3: cam3, 4: cam4 };

	return { engine, scene, cameras };
}
