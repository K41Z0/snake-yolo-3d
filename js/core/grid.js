window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var config = SY.config;

  function inBounds(cell) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < config.grid && cell.y < config.grid;
  }

  function same(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function key(cell) {
    return cell.x + ":" + cell.y;
  }

  function freeCells(occupied) {
    var taken = {};
    for (var i = 0; i < occupied.length; i++) taken[key(occupied[i])] = true;

    var free = [];
    for (var y = 0; y < config.grid; y++) {
      for (var x = 0; x < config.grid; x++) {
        var cell = { x: x, y: y };
        if (!taken[key(cell)]) free.push(cell);
      }
    }
    return free;
  }

  SY.grid = {
    inBounds: inBounds,
    same: same,
    key: key,
    freeCells: freeCells
  };
})(window.SY);
