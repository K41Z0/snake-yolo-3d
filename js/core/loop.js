window.SY = window.SY || {};

(function (SY) {
  "use strict";

  function Loop(stepMs, onTick, onFrame) {
    this.stepMs = stepMs;
    this.onTick = onTick;
    this.onFrame = onFrame;
    this.acc = 0;
    this.last = 0;
    this.active = false;
    this.frame = this.frame.bind(this);
  }

  Loop.prototype.start = function () {
    if (this.active) return;
    this.active = true;
    this.last = 0;
    window.requestAnimationFrame(this.frame);
  };

  Loop.prototype.frame = function (timestamp) {
    if (!this.active) return;
    window.requestAnimationFrame(this.frame);

    if (!this.last) {
      this.last = timestamp;
      return;
    }

    var delta = Math.min(timestamp - this.last, 250);
    this.last = timestamp;

    var step = Math.max(30, this.stepMs());
    this.acc += delta;

    var guard = 0;
    while (this.acc >= step && guard < 6) {
      this.acc -= step;
      this.onTick();
      guard += 1;
    }
    if (guard >= 6) this.acc = 0;

    this.onFrame(this.acc / step);
  };

  SY.Loop = Loop;
})(window.SY);
