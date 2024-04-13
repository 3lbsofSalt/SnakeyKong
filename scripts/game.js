//const { NetworkAction } = require('');
//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
// noinspection JSVoidFunctionReturnValueUsed

MyGame.main = function (objects, input, renderer, graphics) {
  "use strict";

  // let TURNPOINT_TOL = 20;
  //const socket = io();
  console.log("game initializing...");
  //console.log(socket);

  const otherSnakes = [];
/*
  socket.on(NetworkAction.CONNECT_ACK, data => {});

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
    size: { x: 30, y: 30 }, // Size in pixels
    center: { x: 50, y: 150 },
    rotation: 0,
  });
  let littleFood2 = objects.Food({
    size: { x: 30, y: 30 }, // Size in pixels
    center: { x: 450, y: 150 },
    rotation: 0,
  });
  let bigFood = objects.Food({
    size: { x: 40, y: 40 }, // Size in pixels
    center: { x: 50, y: 350 },
    rotation: 0,
  });

  let singleBananas = [littleFood, littleFood2];
  let bunchBananas = [bigFood];

  let singleBananaRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/spritesheet-bananaGreenSingle.png",
      spriteCount: 8,
      spriteTime: [150, 150, 150, 150, 150, 150, 150, 150], // ms per frame
    },
    graphics,
  );
  let bunchBananaRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/spritesheet-bananaYellowBunch.png",
      spriteCount: 12,
      spriteTime: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
      ], // ms per frame
    },
    graphics,
  );

  let dkHeadRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/dkhead.png",
      spriteCount: 1,
      spriteTime: [1000], // ms per frame
    },
    graphics,
  );
  let dkBodyRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/dkbody.png",
      spriteCount: 1,
      spriteTime: [1000], // ms per frame
    },
    graphics,
  );

  const playerSnake = objects.Snake({
    alive: true,
    rotation: 0,
    moveRate: 200 / 1000, // Pixels per second
    rotateRate: Math.PI / 1000, // Radians per second
    keyboard: myKeyboard,
    startingSegments: 8,
    segmentDistance: 30,
    headRenderer: dkHeadRender,
    bodyRenderer: dkBodyRender,
  });

  // This will have to be updated once we had a whole world with camera scrolling.
  function testSnakeWallCollision(snake) {
    let hitHorizontalWall = snake.head.center.x < 0 || snake.head.center.x > graphics.getCanvas().width;
    let hitVerticalWall = snake.head.center.y < 0 || snake.head.center.y > graphics.getCanvas().height;
    if (hitHorizontalWall || hitVerticalWall) {
      snake.kill();
      createDeathBananas(snake);
    }
  }

  // Currently spawns bananas on body segments only, no head
  function createDeathBananas(snake) {
    for (let segment of snake.body) {
        let deathBunch = objects.Food({
        size: { x: 40, y: 40 }, // Size in pixels
        center: { x: segment.center.x, y: segment.center.y },
        rotation: 0
  });

      bunchBananas.push(deathBunch);
    }
  }

  function updateFood(elapsedTime) {
    singleBananaRender.update(elapsedTime);
    bunchBananaRender.update(elapsedTime);
  }

  function renderFood() {
    for (let banana of singleBananas) {
      singleBananaRender.render(banana);
    }
    for (let bunch of bunchBananas) {
      bunchBananaRender.render(bunch);
    }
  }



  function processInput(elapsedTime) {
    myKeyboard.update(elapsedTime);
  }

  function update(elapsedTime) {

    updateFood(elapsedTime);

    if (playerSnake.isAlive()) {
      testSnakeWallCollision(playerSnake);
      playerSnake.update(elapsedTime);
    }
  }

  function render() {
    graphics.clear();

    renderFood();

    // Render segments from last to first
    if (playerSnake.isAlive()) { playerSnake.render(); }
  }

  myKeyboard.register(MyGame.input.keys.up, playerSnake.setDirectionUp);
  myKeyboard.register(MyGame.input.keys.down, playerSnake.setDirectionDown);
  myKeyboard.register(MyGame.input.keys.left, playerSnake.setDirectionLeft);
  myKeyboard.register(MyGame.input.keys.right, playerSnake.setDirectionRight);

  return {
    processInput: processInput,
    update: update,
    render: render,
    dkHead: playerSnake,
  };
};
