window.SY = window.SY || {};

(function (SY) {
  "use strict";

  function Audio() {
    this.context = null;
    this.enabled = true;
  }

  Audio.prototype.ensure = function () {
    if (!this.enabled) return null;
    if (!this.context) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) {
        this.enabled = false;
        return null;
      }
      this.context = new Ctor();
    }
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  };

  Audio.prototype.blip = function (frequency, duration, type, gainValue) {
    var context = this.ensure();
    if (!context) return;
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = type || "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue === undefined ? 0.05 : gainValue;
    oscillator.connect(gain);
    gain.connect(context.destination);
    var now = context.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  Audio.prototype.eat = function () {
    this.blip(660, 0.12, "triangle", 0.05);
    var self = this;
    window.setTimeout(function () { self.blip(990, 0.1, "triangle", 0.04); }, 70);
  };

  Audio.prototype.crash = function () {
    this.blip(150, 0.42, "sawtooth", 0.06);
  };

  Audio.prototype.badge = function () {
    this.blip(1320, 0.16, "sine", 0.05);
    var self = this;
    window.setTimeout(function () { self.blip(1760, 0.18, "sine", 0.04); }, 110);
  };

  Audio.prototype.toggle = function () {
    this.enabled = !this.enabled;
    if (this.enabled) this.blip(880, 0.1, "sine", 0.04);
    return this.enabled;
  };

  SY.Audio = Audio;
})(window.SY);
