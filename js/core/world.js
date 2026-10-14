window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var config = SY.config;
  var grid = SY.grid;

  function World() {
    this.reset();
  }

  World.prototype.reset = function () {
    this.snake = new SY.Snake();
    this.food = { x: config.firstBadge.x, y: config.firstBadge.y };
    this.score = 0;
    this.eaten = 0;
    this.tickMs = config.tickStart;
    this.status = "ready";
    this.best = this.loadBest();
    this.events = [];
  };

  World.prototype.push = function (event) {
    this.events.push(event);
    return event;
  };

  World.prototype.takeEvents = function () {
    var list = this.events;
    this.events = [];
    return list;
  };

  World.prototype.loadBest = function () {
    try {
      var value = Number(window.localStorage.getItem(config.bestKey));
      return isFinite(value) && value > 0 ? value : 0;
    } catch (error) {
      return 0;
    }
  };

  World.prototype.saveBest = function () {
    if (this.score <= this.best) return;
    this.best = this.score;
    try {
      window.localStorage.setItem(config.bestKey, String(this.best));
    } catch (error) {
      /* storage may be unavailable for local files in some browsers */
    }
  };

  World.prototype.startOrResume = function () {
    if (this.status === "running") return;
    if (this.status === "paused") {
      this.status = "running";
      this.push({ type: "resume" });
      return;
    }
    this.restart();
  };

  World.prototype.restart = function () {
    var wasPlaying = this.status === "running" || this.status === "paused";
    var best = this.best;
    this.reset();
    this.best = best;
    this.status = "running";
    this.push({ type: "start", restarted: wasPlaying });
  };

  World.prototype.togglePause = function () {
    if (this.status === "running") {
      this.status = "paused";
      this.push({ type: "pause" });
    } else if (this.status === "paused") {
      this.status = "running";
      this.push({ type: "resume" });
    } else {
      this.startOrResume();
    }
  };

  World.prototype.turn = function (x, y) {
    if (this.status === "ready" || this.status === "over") this.startOrResume();
    if (this.status !== "running") return;
    this.snake.turn(x, y);
  };

  World.prototype.achievementFor = function (count) {
    var list = config.achievements;
    if (!list.length) return null;

    var base = list[0][0];
    var span = list[list.length - 1][0];
    var delta = count - base;
    if (delta < 0) return null;

    var cycle = Math.floor(delta / span);
    var within = delta % span;

    for (var i = 0; i < list.length; i++) {
      if (list[i][0] - base !== within) continue;
      var mark = cycle === 0 ? "" : " x" + (cycle + 1);
      return list[i][1] + mark + " " + list[i][2];
    }
    return null;
  };

  World.prototype.tick = function () {
    if (this.status !== "running") return null;

    var head = this.snake.nextHead();
    var eating = grid.same(head, this.food);
    var result = this.snake.advance(eating);

    if (!result.ok) {
      this.status = "over";
      this.saveBest();
      return this.push({ type: "over", reason: result.reason, cell: this.snake.head() });
    }

    if (!eating) return this.push({ type: "move" });

    this.eaten += 1;
    this.score += config.pointsPerBadge;
    this.tickMs = Math.max(config.tickMin, config.tickStart - this.eaten * config.tickStep);
    this.saveBest();

    var free = grid.freeCells(this.snake.cells);
    this.food = free.length ? free[Math.floor(Math.random() * free.length)] : { x: head.x, y: head.y };

    return this.push({ type: "eat", cell: { x: head.x, y: head.y }, achievement: this.achievementFor(this.eaten) });
  };

  SY.World = World;
})(window.SY);
