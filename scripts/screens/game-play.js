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
        model = MyGame.main(
            MyGame.objects,
            MyGame.input,
            MyGame.render,
            MyGame.graphics,
        );

        myKeyboard.register(MyGame.input.keys.up, model.dkHead.setDirectionUp);
        myKeyboard.register(
            MyGame.input.keys.down,
            model.dkHead.setDirectionDown,
        );
        myKeyboard.register(
            MyGame.input.keys.left,
            model.dkHead.setDirectionLeft,
        );
        myKeyboard.register(
            MyGame.input.keys.right,
            model.dkHead.setDirectionRight,
        );
        // Start the animation loop

        model.start();
    }

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager, MyGame.graphics, MyGame.input);
