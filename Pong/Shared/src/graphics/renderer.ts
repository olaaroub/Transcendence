import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Meshes/meshBuilder.js";
import { GameState } from '../types.js';
import { WIDTH, HEIGHT, PWIDTH, PHEIGHT } from '../constants.js';

export interface GameMeshes
{
	sky: BABYLON.Mesh;
	arena: BABYLON.Mesh;
	paddles: { p1: BABYLON.Mesh; p2: BABYLON.Mesh };
	ball: BABYLON.Mesh;
}

export class Renderer
{
	private meshes: GameMeshes;
	private scene: BABYLON.Scene;
	private engine: BABYLON.Engine;

	constructor(engine: BABYLON.Engine, scene: BABYLON.Scene, meshes: GameMeshes)
	{
		this.engine = engine;
		this.scene = scene;
		this.meshes = meshes;
		// engine.hideLoadingUI();
	}

	render(): void {this.scene.render();}

	updateGameState(state: GameState): void
	{
		this.meshes.paddles.p1.position = this.paddlePosition(state.p1X, state.p1Y, true);
		this.meshes.paddles.p2.position = this.paddlePosition(state.p2X, state.p2Y, false);
		this.meshes.ball.position = this.worldPosition(state.ballX, state.ballY);
		this.meshes.ball.rotate(new BABYLON.Vector3(0, 1, 0), state.ballS);
	}

	private worldPosition(x: number, y: number): BABYLON.Vector3 {return new BABYLON.Vector3(x - WIDTH / 2, 10, y - HEIGHT / 2);}

	private paddlePosition(x: number, y: number, isP1: boolean): BABYLON.Vector3
	{
		return new BABYLON.Vector3
		(
			(x - WIDTH / 2 + PWIDTH / 2) + (isP1 ? -10 : 10),
			10,
			y - HEIGHT / 2 + PHEIGHT / 2
		);
	}

	getActiveCamera(): BABYLON.Camera | null {return this.scene.activeCamera;}

	setActiveCamera(camera: BABYLON.Camera): void {this.scene.activeCamera = camera;}

	runRenderLoop(callback: () => void): void {this.engine.runRenderLoop(callback);}

	dispose(): void
	{
		this.scene.dispose();
		this.engine.dispose();
	}
}

export class PongLoading implements BABYLON.ILoadingScreen
{
	private loadingDiv: HTMLDivElement | null = null;
	public loadingUIBackgroundColor: string = "#000000";
	public loadingUIText: string = "";

	constructor() {}

	public displayLoadingUI(): void
	{
		if (this.loadingDiv)
			return;

		this.loadingDiv = document.createElement("div");
		this.loadingDiv.id = "pongLoading";
		this.loadingDiv.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: ${this.loadingUIBackgroundColor};
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 9999;
		`;

		const gif = document.createElement("img");
		gif.src = "/game/Assets/loading.gif";
		gif.alt = "LOADING...";

		this.loadingDiv.appendChild(gif);
		document.body.appendChild(this.loadingDiv);
	}

	public hideLoadingUI(): void
	{
		if (this.loadingDiv)
		{
			this.loadingDiv.remove();
			this.loadingDiv = null;
		}
	}
}
