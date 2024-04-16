MyGame.screens["game-play"] = (function (manager, graphics, input) {
    "use strict";

    let model = null;

    //------------------------------------------------------------------
    //
    // One time initialization...nothing to do here.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log("game initializing...");
    }

    //------------------------------------------------------------------
    //
    // This is the Game Loop update function!
    //
    //------------------------------------------------------------------

    function run() {
        console.log("running");
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
