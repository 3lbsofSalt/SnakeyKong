MyGame.screens['game-play'] = (function(manager, graphics, input) {
    'use strict';

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
        console.log('game initializing...');
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }
    //------------------------------------------------------------------
    //
    // This is the Game Loop update function!
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {

    }

    function render() {

    }

    function gameLoop(time) {
        let elapsed = time - lastTimeStamp
        processInput(elapsed);
        update(elapsed);
        render()
        lastTimeStamp = time;
        
        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function run() {
        myKeyboard.register('Escape', function() { manager.showScreen('main-menu'); });
        //
        // Start the animation loop
        cancelNextRequest = false;
        lastTimeStamp = performance.now();
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.manager, MyGame.graphics, MyGame.input));
