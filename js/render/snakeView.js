window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var theme = SY.theme;

  var BODY_RADIUS = 0.34;
  var BODY_LENGTH = 0.36;
  var HEAD_RADIUS = 0.42;
  var UP = new THREE.Vector3(0, 1, 0);

  SY.createSnakeView = function (stage) {
    var group = new THREE.Group();
    stage.scene.add(group);

    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: theme.snake, roughness: 0.34, metalness: 0.16,
      emissive: theme.snake, emissiveIntensity: 0.09
    });
    var headMaterial = new THREE.MeshStandardMaterial({
      color: theme.snakeHead, roughness: 0.28, metalness: 0.2,
      emissive: theme.snake, emissiveIntensity: 0.18
    });
    var deadBodyMaterial = new THREE.MeshStandardMaterial({ color: theme.snakeDead, roughness: 0.62, metalness: 0.1 });
    var deadHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x98a1ac, roughness: 0.5, metalness: 0.12 });
    var eyeMaterial = new THREE.MeshStandardMaterial({ color: theme.eye, roughness: 0.35 });

    var bodyGeometry = new THREE.CapsuleGeometry(BODY_RADIUS, BODY_LENGTH, 6, 18);
    var headGeometry = new THREE.SphereGeometry(HEAD_RADIUS, 30, 22);
    var eyeGeometry = new THREE.SphereGeometry(0.085, 14, 12);

    var head = new THREE.Group();
    var headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.castShadow = true;
    head.add(headMesh);
    [-1, 1].forEach(function (side) {
      var eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.set(side * 0.17, 0.13, HEAD_RADIUS * 0.74);
      head.add(eye);
    });
    group.add(head);

    var nodes = [head];
    var previous = [];
    var current = [];
    var pointA = new THREE.Vector3();
    var pointB = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var pop = 0;
    var dead = false;

    function ensure(count) {
      while (nodes.length < count) {
        var segment = new THREE.Mesh(bodyGeometry, bodyMaterial);
        segment.castShadow = true;
        group.add(segment);
        nodes.push(segment);
      }
      for (var i = count; i < nodes.length; i++) nodes[i].visible = false;
      for (var j = 1; j < count; j++) nodes[j].visible = true;
      head.visible = count > 0;
    }

    function pointAt(index, alpha, out) {
      var to = current[index];
      if (!to) return null;
      var from = previous[index] || to;
      return out.copy(from).lerp(to, alpha);
    }

    return {
      sync: function (world) {
        var next = world.snake.cells.map(function (cell) {
          return SY.layout.toWorld(cell);
        });

        if (!current.length) {
          current = next;
          previous = next.map(function (point) { return point.clone(); });
        } else {
          previous = current;
          current = next;
        }

        ensure(current.length);
      },

      setDead: function (value) {
        if (dead === value) return;
        dead = value;
        nodes.forEach(function (node, index) {
          if (index === 0) {
            node.children[0].material = value ? deadHeadMaterial : headMaterial;
          } else {
            node.material = value ? deadBodyMaterial : bodyMaterial;
          }
        });
      },

      pop: function () {
        pop = 1;
      },

      render: function (delta, alpha) {
        if (!current.length) return;

        for (var i = 0; i < current.length; i++) {
          var node = nodes[i];
          if (!node) break;

          var from = previous[i] || current[i];
          var to = current[i];
          pointA.copy(from).lerp(to, alpha);

          var height = i === 0 ? 0.38 : BODY_RADIUS;
          node.position.set(pointA.x, height, pointA.z);

          var taper = Math.max(0.72, 1 - (i / Math.max(1, current.length)) * 0.3);
          if (i === 0) {
            node.scale.setScalar(1 + pop * 0.16);
          } else {
            node.scale.setScalar(taper);
          }

          var neighbour = i === 0 ? 1 : (i + 1 < current.length ? i + 1 : i - 1);
          var neighbourPoint = pointAt(neighbour, alpha, pointB);
          if (!neighbourPoint) continue;

          direction.copy(pointA).sub(neighbourPoint);

          if (i === 0) {
            if (direction.lengthSq() > 0.0001) {
              node.rotation.y = Math.atan2(direction.x, direction.z);
            }
          } else if (direction.lengthSq() > 0.0001) {
            direction.normalize();
            node.quaternion.setFromUnitVectors(UP, direction);
          }
        }

        if (pop > 0) pop = Math.max(0, pop - delta * 3.4);
      }
    };
  };
})(window.SY);
