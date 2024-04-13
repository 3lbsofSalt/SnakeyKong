const NetworkAction = require(["server/src/shared/NetworkActions.js"]);
//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
// noinspection JSVoidFunctionReturnValueUsed

MyGame.main = function (objects, input, renderer, graphics) {
    "use strict";

    let cancelNextRequest = true;
    const socket = io();
    let playerSnake = {};
    console.log("game initializing...");
    const otherSnakes = [];

    /*
  socket.on(NetworkAction.CONNECT_ACK, () => { 
    console.log('Connected to the Server!');
  });
  */
    socket.on("connect-ack", () => {
        console.log("Connected to the Server!");
    });

    /*
  // This will be called after the client emits a join request to the server
  socket.on(NetworkAction.CLIENT_JOIN, data => {
    // Initialize the snake from data obtained from the server
    playerSnake = objects.Snake({
      rotation: data.rotation,
      center: data.position,
      moveRate: data.moveRate,
      rotateRate: data.rotateRate,
      segmentDistance: data.segmentDistance,
      startingSegments: 3,
      keyboard: myKeyboard,
      headRenderer: dkHeadRender,
      bodyRenderer: dkBodyRender
    });

    cancelNextRequest = false;
    requestAnimationFrame(gameLoop);
  });

  socket.on('connect', () => {
    console.log('connected');
  });
  
  socket.on('disconnect', (stuff) => {
    console.log(stuff);
    console.log('disconnect');
  });

  socket.on('parse error', (data, error) => {
    console.log('thingy')
    console.log(data);
    console.log(error);
  })

  socket.on("connect_error", (err) => {
    // the reason of the error, for example "xhr poll error"
    console.log(err.message);

    // some additional description, for example the status code of the initial HTTP response
    console.log(err.description);

    // some additional context, for example the XMLHttpRequest object
    console.log(err.context);
  });

  socket.on(NetworkAction.CONNECT_OTHER, data => {

  });
  */

    let lastTimeStamp = performance.now();

    let myKeyboard = input.Keyboard();

    const dkHeadRender = renderer.AnimatedModel(
        {
            spriteSheet: "assets/dkhead.png",
            spriteCount: 1,
            spriteTime: [1000], // ms per frame
        },
        graphics,
    );
    const dkBodyRender = renderer.AnimatedModel(
        {
            spriteSheet: "assets/dkbody.png",
            spriteCount: 1,
            spriteTime: [1000], // ms per frame
        },
        graphics,
    );
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

  function processInput(elapsedTime) {
    myKeyboard.update(elapsedTime);
  }

  function gameLoop(time) {
    let elapsed = time - lastTimeStamp;
    processInput(elapsed);
    update(elapsed);
    render();
    lastTimeStamp = time;

    if (!cancelNextRequest) {
      requestAnimationFrame(gameLoop);
    }
  }
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

  myKeyboard.register("Escape", function () {
    cancelNextRequest = true;
    manager.showScreen("main-menu");
  });

  function start() {
    console.log("yarg");
    //socket.emit(NetworkAction.CLIENT_JOIN_REQUEST, {});
  }

  return {
    processInput: processInput,
    update: update,
    render: render,
    start: start,
    dkHead: playerSnake,
  };
};
