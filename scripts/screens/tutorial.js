MyGame.screens["tutorial"] = (function (manager) {
    "use strict";

    function initialize() {
        document.getElementById("start").addEventListener("click", function () {
            manager.showScreen("game-play");
        });
    }

    function run() {}

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager);
