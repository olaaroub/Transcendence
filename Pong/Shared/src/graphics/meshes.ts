import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Meshes/meshBuilder.js";
import { GridMaterial } from "@babylonjs/materials";
import { WIDTH, HEIGHT, PWIDTH, PHEIGHT } from '../constants.js';
import { createArenaMaterial, createPaddleMaterial, createBallMaterial, createSkyMaterial} from './materials.js';

export function createArena(scene: BABYLON.Scene): BABYLON.Mesh
{
	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: WIDTH, height: HEIGHT }, scene);
	const leftWall = BABYLON.MeshBuilder.CreateBox("L", { width: WIDTH, height: 20, depth: 2 }, scene);
	const rightWall = BABYLON.MeshBuilder.CreateBox("R", { width: WIDTH, height: 20, depth: 2 }, scene);
	ground.position.y = 0.1;
	leftWall.position = new BABYLON.Vector3(0, 10, -HEIGHT / 2 + 1);
	rightWall.position = new BABYLON.Vector3(0, 10, HEIGHT / 2 + 1);
	let mat = createArenaMaterial(scene);
	ground.material = mat;
	leftWall.material = mat;
	rightWall.material = mat;
	const arena = BABYLON.Mesh.MergeMeshes([ ground, leftWall, rightWall ], true, true, undefined, false, true);
	arena!.name = "Arena";
	arena!.position = BABYLON.Vector3.Zero();
	return arena!;
}

export function createSky(scene: BABYLON.Scene): BABYLON.Mesh
{
	const sky = BABYLON.MeshBuilder.CreateSphere("Space", { diameter: 1000, segments: 32 }, scene);
	sky.infiniteDistance = true;
	sky.isPickable = false;
	sky.material = createSkyMaterial(scene);
	return sky;
}

export function createBall(scene: BABYLON.Scene): BABYLON.Mesh
{
	const ball = BABYLON.MeshBuilder.CreateSphere('Ball', { diameter: 10, segments: 32 }, scene);
	ball.material = createBallMaterial(scene);
	ball.position = new BABYLON.Vector3(0, 10, 0);
	const glow = new BABYLON.PointLight("BallGlow", ball.position, scene);
	glow.diffuse = (ball.material as GridMaterial).mainColor;
	glow.parent = ball;
	glow.intensity = 500;
	glow.range = 800;
	return ball;
}

export function createPaddles(scene: BABYLON.Scene): { p1: BABYLON.Mesh; p2: BABYLON.Mesh }
{
	const p1Paddle = BABYLON.MeshBuilder.CreateBox('p1', { width: 10, height: 10, depth: PHEIGHT }, scene);
	const p2Paddle = BABYLON.MeshBuilder.CreateBox('p2', { width: 10, height: 10, depth: PHEIGHT }, scene);
	p1Paddle.material = createPaddleMaterial(scene);
	p2Paddle.material = createPaddleMaterial(scene);
	return { p1: p1Paddle, p2: p2Paddle };
}
