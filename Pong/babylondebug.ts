var createScene = function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

    // Move the sphere upward 1/2 its height
    // sphere.position.y = 1;

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

    // GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var cadre = new BABYLON.GUI.Container("BOX");
    cadre.adaptHeightToChildren = true;
    cadre.adaptWidthToChildren = true;

    var text = "MESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSIMESSI";
    var signText = new BABYLON.GUI.TextBlock('SignText', text);
    signText.color = "orange";
    signText.resizeToFit = true;


    var sign = new BABYLON.GUI.Image('Sign', 'textures/grass.png');
	sign.stretch = BABYLON.GUI.Image.STRETCH_FILL;
    // advancedTexture.addControl(sign);
    cadre.addControl(sign);
    cadre.addControl(signText);
    advancedTexture.addControl(cadre);
    return scene;
};
export default createScene
