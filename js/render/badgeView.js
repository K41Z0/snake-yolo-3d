window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var theme = SY.theme;

  function badgeTexture() {
    var size = 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    var grd = ctx.createRadialGradient(size * 0.38, size * 0.32, size * 0.06, size * 0.5, size * 0.5, size * 0.62);
    grd.addColorStop(0, "#ffe9a8");
    grd.addColorStop(0.45, "#e3b341");
    grd.addColorStop(1, "#a86f14");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.47, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 240, 200, 0.85)";
    ctx.lineWidth = size * 0.03;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#3a2504";
    ctx.font = "700 " + Math.round(size * 0.2) + "px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOLO", size / 2, size / 2 + size * 0.01);

    var texture = new THREE.CanvasTexture(canvas);
    if ("colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function sparkTexture() {
    var size = 64;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    var grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, "rgba(255, 240, 190, 1)");
    grd.addColorStop(0.35, "rgba(240, 198, 90, 0.85)");
    grd.addColorStop(1, "rgba(240, 198, 90, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    var texture = new THREE.CanvasTexture(canvas);
    if ("colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  var SPARKS = 26;

  SY.createBadgeView = function (stage) {
    var group = new THREE.Group();

    var coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.13, 44),
      new THREE.MeshStandardMaterial({
        color: theme.gold,
        metalness: 0.95,
        roughness: 0.28,
        emissive: theme.gold,
        emissiveIntensity: 0.18
      })
    );
    coin.rotation.x = Math.PI / 2;
    coin.castShadow = true;
    group.add(coin);

    var label = new THREE.Mesh(
      new THREE.CircleGeometry(0.4, 40),
      new THREE.MeshStandardMaterial({
        map: badgeTexture(),
        metalness: 0.6,
        roughness: 0.3,
        emissive: theme.goldLight,
        emissiveIntensity: 0.12
      })
    );
    label.position.z = 0.075;
    coin.add(label);

    var back = new THREE.Mesh(
      new THREE.CircleGeometry(0.4, 40),
      new THREE.MeshStandardMaterial({ color: theme.goldLight, metalness: 0.9, roughness: 0.35 })
    );
    back.position.z = -0.075;
    back.rotation.y = Math.PI;
    coin.add(back);

    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.66, 48),
      new THREE.MeshBasicMaterial({ color: theme.glow, transparent: true, opacity: 0.32, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    group.add(ring);

    var light = new THREE.PointLight(theme.glow, 7, 6.5, 2);
    light.position.set(0, 0.8, 0);
    group.add(light);

    var sparkGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(SPARKS * 3);
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var sparkMaterial = new THREE.PointsMaterial({
      size: 0.42,
      map: sparkTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: theme.goldLight
    });
    var sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    group.add(sparks);

    stage.scene.add(group);

    var velocities = [];
    for (var i = 0; i < SPARKS; i++) {
      var angle = (i / SPARKS) * Math.PI * 2;
      var speed = 1.6 + Math.random() * 2.2;
      velocities.push({
        x: Math.cos(angle) * speed,
        y: 1.4 + Math.random() * 2.4,
        z: Math.sin(angle) * speed
      });
    }

    var burstTime = -1;
    var origin = new THREE.Vector3();
    var clock = 0;

    return {
      group: group,

      setCell: function (cell) {
        var point = SY.layout.toWorld(cell);
        group.position.set(point.x, 0.62, point.z);
        origin.copy(group.position);
      },

      burst: function (cell) {
        if (cell) {
          var point = SY.layout.toWorld(cell);
          origin.set(point.x, 0.62, point.z);
        }
        burstTime = 0;
        for (var i = 0; i < SPARKS; i++) {
          positions[i * 3] = origin.x;
          positions[i * 3 + 1] = origin.y;
          positions[i * 3 + 2] = origin.z;
        }
        sparkGeometry.attributes.position.needsUpdate = true;
      },

      update: function (delta) {
        clock += delta;
        coin.rotation.y += delta * 1.1;
        group.position.y = 0.62 + Math.sin(clock * 2.1) * 0.06;
        ring.scale.setScalar(1 + Math.sin(clock * 2.4) * 0.06);
        light.intensity = 6.4 + Math.sin(clock * 2.6) * 1.1;

        if (burstTime >= 0) {
          burstTime += delta;
          var life = burstTime / 0.75;
          if (life >= 1) {
            burstTime = -1;
            sparkMaterial.opacity = 0;
            return;
          }
          for (var i = 0; i < SPARKS; i++) {
            positions[i * 3] = origin.x + velocities[i].x * burstTime;
            positions[i * 3 + 1] = origin.y + velocities[i].y * burstTime - 3.2 * burstTime * burstTime;
            positions[i * 3 + 2] = origin.z + velocities[i].z * burstTime;
          }
          sparkGeometry.attributes.position.needsUpdate = true;
          sparkMaterial.opacity = 1 - life;
          sparkMaterial.size = 0.42 * (1 - life * 0.4);
        }
      }
    };
  };
})(window.SY);
