window.SY = window.SY || {};

(function (SY) {
  "use strict";

  SY.bindInput = function (world, handlers) {
    var keys = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
    };

    window.document.addEventListener("keydown", function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var name = event.key && event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (keys[name]) {
        event.preventDefault();
        world.turn(keys[name][0], keys[name][1]);
        return;
      }
      if (event.key === " " || name === "p") {
        event.preventDefault();
        world.togglePause();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        world.restart();
        return;
      }
      if (name === "m" && handlers && handlers.toggleSound) {
        handlers.toggleSound();
      }
    });

    var start = null;
    var surface = window.document.getElementById("surface");

    surface.addEventListener("pointerdown", function (event) {
      start = { x: event.clientX, y: event.clientY };
      world.startOrResume();
    });

    surface.addEventListener("pointerup", function (event) {
      if (!start) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) world.turn(dx > 0 ? 1 : -1, 0);
      else world.turn(0, dy > 0 ? 1 : -1);
    });

    Array.prototype.forEach.call(window.document.querySelectorAll(".pad button"), function (button) {
      button.addEventListener("click", function () {
        var dir = button.dataset.dir;
        var map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        if (!map[dir]) return;
        world.turn(map[dir][0], map[dir][1]);
      });
    });
  };
})(window.SY);
