import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Meshes/meshBuilder";
import { GridMaterial } from "@babylonjs/materials";

export function createArenaMaterial(scene: BABYLON.Scene): BABYLON.PBRMaterial
{
	const mat = new BABYLON.PBRMaterial("ArenaGlass", scene);
	mat.albedoColor = BABYLON.Color3.FromHexString("#f53d05");
	mat.forceDepthWrite = true;

	mat.alpha = 0.6;
	mat.roughness = 0.5;
	mat.reflectivityColor = new BABYLON.Color3(1, 0, 0);

	mat.environmentIntensity = 1.0;
	mat.specularIntensity = 0.7;

	mat.backFaceCulling = false;
	mat.useRadianceOverAlpha = true;
	mat.usePhysicalLightFalloff = true;
	mat.useHorizonOcclusion = true;
	mat.useRadianceOcclusion = true;

	return mat;
}

export function createSkyMaterial(scene: BABYLON.Scene): BABYLON.StandardMaterial
{
	const mat = new BABYLON.StandardMaterial("Space", scene);

	mat.backFaceCulling = false;
	mat.disableLighting = true;
	mat.disableDepthWrite = true;

	const spaceUrl = "../Assets/space.png";
	const tex = new BABYLON.Texture(spaceUrl, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
	mat.emissiveTexture = tex;

	return mat;
}

export function createPaddleMaterial(scene: BABYLON.Scene): BABYLON.Material
{
	const mat = new GridMaterial("paddleGrid", scene);

	mat.gridRatio = 1;
	mat.majorUnitFrequency = 5;
	mat.minorUnitVisibility = 0.1;

	mat.mainColor = new BABYLON.Color3(0, 0, 0);
	mat.lineColor = new BABYLON.Color3(0, 1, 1);

	return mat;
}

export function createBallMaterial(scene: BABYLON.Scene): BABYLON.Material
{
	const mat = new GridMaterial("ballMaterial", scene);
	mat.mainColor = new BABYLON.Color3(0, 0, 0);
	mat.lineColor = new BABYLON.Color3(0, 1, 1);
	
	mat.gridRatio = 1;
	mat.gridOffset = BABYLON.Vector3.Zero();
	mat.majorUnitFrequency = 4;
	mat.minorUnitVisibility = 1;
	
	return mat;
}
