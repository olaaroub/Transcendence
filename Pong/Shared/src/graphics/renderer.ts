import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Meshes/meshBuilder";
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
