window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var theme = SY.theme;

  SY.createStage = function (canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.background);
    scene.fog = new THREE.Fog(theme.fog, 44, 76);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 27.5, 18.5);
    camera.lookAt(0, 0, 1.2);

    scene.add(new THREE.HemisphereLight(0x93b6ff, 0x080c14, 0.6));

    var key = new THREE.DirectionalLight(0xfff4e0, 2.1);
    key.position.set(-11, 22, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -17;
    key.shadow.camera.right = 17;
    key.shadow.camera.top = 17;
    key.shadow.camera.bottom = -17;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 70;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    scene.add(key.target);

    var rim = new THREE.DirectionalLight(theme.accent, 0.75);
    rim.position.set(13, 9, -14);
    scene.add(rim);

    return {
      renderer: renderer,
      scene: scene,
      camera: camera,

      resize: function (width, height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      },

      render: function () {
        renderer.render(scene, camera);
      }
    };
  };
})(window.SY);
