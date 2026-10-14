window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var theme = SY.theme;
  var config = SY.config;

  function tileTexture() {
    var cells = config.grid;
    var px = 64;
    var canvas = document.createElement("canvas");
    canvas.width = cells * px;
    canvas.height = cells * px;
    var ctx = canvas.getContext("2d");

    for (var y = 0; y < cells; y++) {
      for (var x = 0; x < cells; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#1a222e" : "#151c27";
        ctx.fillRect(x * px, y * px, px, px);
      }
    }

    ctx.strokeStyle = "rgba(120, 150, 190, 0.16)";
    ctx.lineWidth = 2;
    for (var i = 0; i <= cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * px, 0);
      ctx.lineTo(i * px, cells * px);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * px);
      ctx.lineTo(cells * px, i * px);
      ctx.stroke();
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    if ("colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  SY.createBoard = function (stage) {
    var span = config.grid;
    var group = new THREE.Group();

    var base = new THREE.Mesh(
      new THREE.BoxGeometry(span + 1.6, 1.1, span + 1.6),
      new THREE.MeshStandardMaterial({ color: theme.base, roughness: 0.9, metalness: 0.15 })
    );
    base.position.y = -0.56;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    var top = new THREE.Mesh(
      new THREE.PlaneGeometry(span, span),
      new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.62, metalness: 0.08 })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.002;
    top.receiveShadow = true;
    group.add(top);

    var wallMaterial = new THREE.MeshStandardMaterial({ color: theme.wall, roughness: 0.55, metalness: 0.35 });
    var wallTop = new THREE.MeshStandardMaterial({
      color: theme.wallTop,
      roughness: 0.4,
      metalness: 0.4,
      emissive: theme.accent,
      emissiveIntensity: 0.12
    });

    var thickness = 0.7;
    var height = 0.55;
    var half = span / 2 + thickness / 2;
    var sides = [
      { x: 0, z: -half, w: span + thickness * 2, d: thickness },
      { x: 0, z: half, w: span + thickness * 2, d: thickness },
      { x: -half, z: 0, w: thickness, d: span + thickness * 2 },
      { x: half, z: 0, w: thickness, d: span + thickness * 2 }
    ];

    sides.forEach(function (side) {
      var wall = new THREE.Mesh(new THREE.BoxGeometry(side.w, height, side.d), [
        wallMaterial, wallMaterial, wallTop, wallMaterial, wallMaterial, wallMaterial
      ]);
      wall.position.set(side.x, height / 2 - 0.06, side.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);
    });

    stage.scene.add(group);

    return {
      group: group,
      add: function (object) {
        group.add(object);
      }
    };
  };
})(window.SY);
