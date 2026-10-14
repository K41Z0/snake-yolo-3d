window.SY = window.SY || {};

(function (SY) {
  "use strict";

  SY.config = {
    grid: 20,
    startCell: { x: 6, y: 10 },
    firstBadge: { x: 12, y: 10 },
    startLength: 3,

    pointsPerBadge: 10,
    tickStart: 190,
    tickMin: 90,
    tickStep: 4,

    bestKey: "snakeYolo3dBest",

    achievements: [
      [3, "Snack Attack", "🍪"],
      [6, "Big Appetite", "🍽️"],
      [10, "Unstoppable", "🔥"],
      [16, "Apex", "🏔️"],
      [24, "Legend", "🏆"]
    ]
  };
})(window.SY);
