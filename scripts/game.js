//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
// noinspection JSVoidFunctionReturnValueUsed

MyGame.main = (function (objects, input, renderer, graphics) {
    'use strict';

    let TURNPOINT_TOL = 20;
    let ROTATION_TOL = Math.PI / 50;
    console.log('game initializing...');

    let lastTimeStamp = performance.now();

    let myKeyboard = input.Keyboard();

    let littleFood = objects.Food({
        size: { x: 50, y: 50 },       // Size in pixels
        center: { x: 50, y: 150 },
        rotation: 0
    });
    let bigFood = objects.Food({
        size: { x: 75, y: 75 },       // Size in pixels
        center: { x: 50, y: 350 },
        rotation: 0
    });
    let dkHead = objects.Head({
        size: { x: 75, y: 50 },       // Size in pixels
        center: { x: 250, y: 350 },
        rotation: 0,
        desiredRotation: 0,
        moveRate: 200 / 1000,          // Pixels per second
        rotateRate: Math.PI / 500,   // Radians per second
        keyboard: myKeyboard
    });
    let dkBody = objects.Body({
        size: { x: 50, y: 50 },       // Size in pixels
        center: { x: 220, y: 350 },
        rotation: 0,
        moveRate: 200 / 1000,          // Pixels per second
        rotateRate: Math.PI / 1000,    // Radians per second
        nextLocations: [{ x: 250, y: 350 }]
    });

    let littleBirdRender = renderer.AnimatedModel({
        spriteSheet: 'assets/spritesheet-bananaGreenSingle.png',
        spriteCount: 8,
        spriteTime: [150, 150, 150, 150, 150, 150, 150, 150],   // ms per frame
    }, graphics);
    let bigBirdRender = renderer.AnimatedModel({
        spriteSheet: 'assets/spritesheet-bananaPurpleBunch.png',
        spriteCount: 12,
        spriteTime: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],   // ms per frame
    }, graphics);
    let dkHeadRender = renderer.AnimatedModel({
        spriteSheet: 'assets/dkhead.png',
        spriteCount: 1,
        spriteTime: [1000],   // ms per frame
    }, graphics);
    let dkBodyRender = renderer.AnimatedModel({
        spriteSheet: 'assets/dkbody.png',
        spriteCount: 1,
        spriteTime: [1000],   // ms per frame
    }, graphics);

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function updateRotation(elapsedTime) {
        dkHead.rotation = dkHead.rotation % (2 * Math.PI);
        dkBody.nextLocations.push(dkHead.center);
        //console.log("ROTATE VS DESIRED ROTATE    " + dkHead.rotation + "     " + dkHead.desiredRotation);
        if (Math.abs(dkHead.rotation - dkHead.desiredRotation) > ROTATION_TOL) {
            const leftIsCloser = (dkHead.desiredRotation - dkHead.rotation + 2 * Math.PI) % (2 * Math.PI) > Math.PI;
            if (leftIsCloser) { dkHead.rotateLeft(elapsedTime); }
            else { dkHead.rotateRight(elapsedTime); }
        }
        else { dkHead.rotation = dkHead.desiredRotation; }
    }

    //------------------------------------------------------------------
    //
    // Update the particles
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        littleBirdRender.update(elapsedTime);
        bigBirdRender.update(elapsedTime);
        dkHeadRender.update(elapsedTime);
        dkBodyRender.update(elapsedTime);

        //console.log(dkBody.nextLocations.length);

        dkHead.moveForward(elapsedTime);
        dkBody.moveForward(elapsedTime);

        updateRotation(elapsedTime);

    }

    //------------------------------------------------------------------
    //
    // Render the particles
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();

        littleBirdRender.render(littleFood);
        bigBirdRender.render(bigFood);

        // Render segments from last to first
        dkBodyRender.render(dkBody);
        dkHeadRender.render(dkHead);
        //console.log("RENDERING");
    }

    return {
        processInput: processInput,
        update: update,
        render: render,
        dkHead: dkHead
    }

});
