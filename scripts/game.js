const NetworkAction = require(['server/src/shared/NetworkActions.js']);
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

  const otherSnakes = [];

  /*
  socket.on(NetworkAction.CONNECT_ACK, () => { 
    console.log('Connected to the Server!');
  });
  */
  socket.on('connect-ack', () => { 
    console.log('Connected to the Server!');
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

  let littleFood = objects.Food({
    size: { x: 50, y: 50 }, // Size in pixels
    center: { x: 50, y: 150 },
    rotation: 0,
  });
  let bigFood = objects.Food({
    size: { x: 75, y: 75 }, // Size in pixels
    center: { x: 50, y: 350 },
    rotation: 0,
  });

  const littleBirdRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/spritesheet-bananaGreenSingle.png",
      spriteCount: 8,
      spriteTime: [150, 150, 150, 150, 150, 150, 150, 150], // ms per frame
    },
    graphics,
  );
  const bigBirdRender = renderer.AnimatedModel(
    {
      spriteSheet: "assets/spritesheet-bananaPurpleBunch.png",
      spriteCount: 12,
      spriteTime: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
      ], // ms per frame
    },
    graphics,
  );
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

  myKeyboard.register("Escape", function () {
    cancelNextRequest = true;
    manager.showScreen("main-menu");
  });

  function start() {
    console.log('yarg')
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
