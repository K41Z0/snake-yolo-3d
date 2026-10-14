window.SY = window.SY || {};

(function (SY) {
  "use strict";

  function Hud() {
    this.score = document.getElementById("score");
    this.best = document.getElementById("best");
    this.overlay = document.getElementById("overlay");
    this.title = document.getElementById("ov-title");
    this.text = document.getElementById("ov-text");
    this.result = document.getElementById("ov-score");
    this.hint = document.getElementById("ov-hint");
    this.toast = document.getElementById("toast");
    this.toastTimer = 0;
  }

  Hud.prototype.setScore = function (score) {
    this.score.textContent = score;
  };

  Hud.prototype.setBest = function (best) {
    this.best.textContent = best;
  };

  Hud.prototype.showToast = function (text) {
    var toast = this.toast;
    toast.textContent = text;
    toast.classList.add("show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1600);
  };

  Hud.prototype.hideOverlay = function () {
    this.overlay.hidden = true;
  };

  Hud.prototype.showReady = function () {
    this.overlay.hidden = false;
    this.title.textContent = "Ready?";
    this.text.innerHTML = "Arrows or WASD to move. <kbd>Space</kbd> to pause.";
    this.result.textContent = "";
    this.hint.innerHTML = "Press <kbd>Enter</kbd> or tap the board to start";
  };

  Hud.prototype.showPaused = function () {
    this.overlay.hidden = false;
    this.title.textContent = "Paused";
    this.text.innerHTML = "<kbd>Space</kbd> to resume";
    this.result.textContent = "";
    this.hint.textContent = "";
  };

  Hud.prototype.showOver = function (score, best, isRecord, eaten) {
    this.overlay.hidden = false;
    this.title.textContent = "Game over";
    this.text.textContent = "Badges eaten: " + eaten;
    this.result.textContent = "Score " + score;
    this.hint.innerHTML = isRecord
      ? "New record! <kbd>Enter</kbd> to play again"
      : "Best " + best + ". <kbd>Enter</kbd> to play again";
  };

  SY.Hud = Hud;
})(window.SY);
