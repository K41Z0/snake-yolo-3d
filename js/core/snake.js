window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var config = SY.config;
  var grid = SY.grid;

  function Snake() {
    this.reset();
  }

  Snake.prototype.reset = function () {
    this.cells = [];
    for (var i = 0; i < config.startLength; i++) {
      this.cells.push({ x: config.startCell.x - i, y: config.startCell.y });
    }
    this.direction = { x: 1, y: 0 };
    this.pending = null;
  };

  Snake.prototype.head = function () {
    return this.cells[0];
  };

  Snake.prototype.turn = function (x, y) {
    var dir = this.direction;
    if (x === -dir.x && y === -dir.y) return;
    this.pending = { x: x, y: y };
  };

  Snake.prototype.nextHead = function () {
    var dir = this.pending || this.direction;
    var head = this.head();
    return { x: head.x + dir.x, y: head.y + dir.y };
  };

  Snake.prototype.advance = function (eating) {
    if (this.pending) {
      this.direction = this.pending;
      this.pending = null;
    }

    var head = this.nextHead();
    var body = eating ? this.cells : this.cells.slice(0, -1);

    var hitsWall = !grid.inBounds(head);
    var hitsSelf = false;
    for (var i = 0; i < body.length; i++) {
      if (grid.same(body[i], head)) { hitsSelf = true; break; }
    }

    if (hitsWall || hitsSelf) {
      return { ok: false, reason: hitsWall ? "wall" : "self" };
    }

    this.cells.unshift(head);
    if (!eating) this.cells.pop();
    return { ok: true };
  };

  SY.Snake = Snake;
})(window.SY);
