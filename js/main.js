window.SY = window.SY || {};

(function (SY) {
  "use strict";

  var canvas = document.getElementById("view");
  var stage = SY.createStage(canvas);
  var hud = new SY.Hud();
  var audio = new SY.Audio();
  var world = new SY.World();

  SY.createBoard(stage);
  var snakeView = SY.createSnakeView(stage);
  var badgeView = SY.createBadgeView(stage);

  var lastFrame = window.performance ? window.performance.now() : 0;

  function fit() {
    stage.resize(window.innerWidth, window.innerHeight);
  }

  function resetView() {
    snakeView.setDead(false);
    snakeView.sync(world);
    snakeView.sync(world);
    badgeView.setCell(world.food);
  }

  function applyEvent(event) {
    if (!event) return;

    if (event.type === "start") {
      resetView();
      hud.hideOverlay();
      hud.setScore(world.score);
      hud.setBest(world.best);
      if (event.restarted) hud.showToast("Restarted");
      return;
    }

    if (event.type === "move") return;

    if (event.type === "pause") {
      hud.showPaused();
      return;
    }

    if (event.type === "resume") {
      hud.hideOverlay();
      return;
    }

    if (event.type === "eat") {
      snakeView.pop();
      badgeView.burst(event.cell);
      badgeView.setCell(world.food);
      hud.setScore(world.score);
      hud.setBest(world.best);
      audio.eat();
      if (event.achievement) {
        hud.showToast("Achievement: " + event.achievement);
        audio.badge();
      }
      return;
    }

    if (event.type === "over") {
      snakeView.setDead(true);
      audio.crash();
      hud.showOver(world.score, world.best, world.score >= world.best && world.score > 0, world.eaten);
    }
  }

  SY.bindInput(world, {
    toggleSound: function () {
      hud.showToast(audio.toggle() ? "Sound on" : "Sound off");
    }
  });

  function drainEvents() {
    var events = world.takeEvents();
    for (var i = 0; i < events.length; i++) applyEvent(events[i]);
  }

  function onTick() {
    var ticked = world.tick();
    if (ticked && world.status === "running") snakeView.sync(world);
    drainEvents();
  }

  function onFrame(alpha) {
    drainEvents();

    var now = window.performance ? window.performance.now() : 0;
    var delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    snakeView.render(delta, world.status === "running" ? alpha : 1);
    badgeView.update(delta);
    stage.render();
  }

  window.addEventListener("resize", fit);
  fit();

  hud.setScore(world.score);
  hud.setBest(world.best);
  hud.showReady();
  resetView();

  new SY.Loop(function () {
    return world.tickMs;
  }, onTick, onFrame).start();

  SY.game = {
    world: world,
    stage: stage,
    snakeView: snakeView,
    badgeView: badgeView,
    hud: hud,
    audio: audio
  };
})(window.SY);
