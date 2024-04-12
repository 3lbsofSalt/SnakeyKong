//const { NetworkAction } = require('');
//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
// noinspection JSVoidFunctionReturnValueUsed

MyGame.main = (function (objects, input, renderer, graphics) {
  'use strict';

  let TURNPOINT_TOL = 20;
  const socket = io();
  console.log('game initializing...');
  console.log(socket)

  const otherSnakes = [];

  /*
  socket.on(NetworkAction.CONNECT_ACK, data => {
  });

  // This will be called after the client emits a join request to the server
  socket.on(NetworkAction.CLIENT_JOIN, data => {
    // Initialize the snake from data obtained from the server
  });

  socket.on(NetworkAction.CONNECT_OTHER, data => {

  });
  */

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

  const playerSnake = objects.Snake({
    rotation: 0,
    moveRate: 200 / 1000,          // Pixels per second
    rotateRate: Math.PI / 1000,    // Radians per second
    keyboard: myKeyboard,
    startingSegments: 30,
    segmentDistance: 30,
    headRenderer: dkHeadRender,
    bodyRenderer: dkBodyRender
  });

  function processInput(elapsedTime) {
    myKeyboard.update(elapsedTime);
  }

  //------------------------------------------------------------------
  //
  // Update the particles
  //
  //------------------------------------------------------------------
  function update(elapsedTime) {
    littleBirdRender.render(littleFood);
    bigBirdRender.render(bigFood);

    playerSnake.update(elapsedTime);
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
    playerSnake.render();
  }

  myKeyboard.register(MyGame.input.keys.up, playerSnake.setDirectionUp);
  myKeyboard.register(MyGame.input.keys.down, playerSnake.setDirectionDown);
  myKeyboard.register(MyGame.input.keys.left, playerSnake.setDirectionLeft);
  myKeyboard.register(MyGame.input.keys.right, playerSnake.setDirectionRight);

  return {
    processInput: processInput,
    update: update,
    render: render,
    dkHead: playerSnake
  }

});
