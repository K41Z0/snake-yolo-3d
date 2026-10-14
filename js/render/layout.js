window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var config = SY.config;

  function offset() {
    return (config.grid - 1) / 2;
  }

  function toWorld(cell) {
    var o = offset();
    return new THREE.Vector3(cell.x - o, 0, cell.y - o);
  }

  function toWorldXZ(cell, target) {
    var o = offset();
    target.set(cell.x - o, 0, cell.y - o);
    return target;
  }

  SY.layout = {
    cells: config.grid,
    span: config.grid,
    toWorld: toWorld,
    toWorldXZ: toWorldXZ
  };
})(window.SY);
