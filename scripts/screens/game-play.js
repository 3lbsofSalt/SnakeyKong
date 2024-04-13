MyGame.screens["game-play"] = (function (manager, graphics, input) {
    "use strict";

    let model = null;
    let myKeyboard = input.Keyboard();

    //------------------------------------------------------------------
    //
    // One time initialization...nothing to do here.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log("game initializing...");
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        model.processInput(elapsedTime);
    }
    //------------------------------------------------------------------
    //
    // This is the Game Loop update function!
    //
    //------------------------------------------------------------------

    function run() {
        console.log("running");
        myKeyboard.register("Escape", function () {
            cancelNextRequest = true;
            manager.showScreen("main-menu");
        });
        updateControls();
        model = MyGame.main(
            MyGame.objects,
            MyGame.input,
            MyGame.render,
            MyGame.graphics,
        );

        // Start the animation loop

        model.start();
    }

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager, MyGame.graphics, MyGame.input);
