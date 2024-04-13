MyGame.screens["game-play"] = (function (manager, graphics, input) {
    "use strict";

    let cancelNextRequest = false;
    let lastTimeStamp;
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

    function gameLoop(time) {
        let elapsed = time - lastTimeStamp;
        processInput(elapsed);
        model.update(elapsed);
        model.render();
        lastTimeStamp = time;

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

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

        cancelNextRequest = false;
        lastTimeStamp = performance.now();
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize,
        run: run,
    };
})(MyGame.manager, MyGame.graphics, MyGame.input);
