MyGame.main = function (objects, input, renderer, graphics) {

  function registerKeys() {
    myKeyboard.register(MyGame.input.keys.right, () => {
      if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.up)) {
        playerSnake.setDirectionUpRight();
        socket.emit("input", { command: "up-right" });
      } else if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.down)) {
        playerSnake.setDirectionDownRight();
        socket.emit("input", { command: "down-right" });
      } else {
        playerSnake.setDirectionRight();
        socket.emit("input", { command: "right" });
      }
    });
    myKeyboard.register(MyGame.input.keys.down, () => {
      if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.left)) {
        playerSnake.setDirectionDownLeft();
        socket.emit("input", { command: "down-left" });
      } else if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.right)) {
        playerSnake.setDirectionDownRight();
        socket.emit("input", { command: "up-right" });
      } else {
        playerSnake.setDirectionDown();
        socket.emit("input", { command: "down" });
      }
    });
    myKeyboard.register(MyGame.input.keys.left, () => {
      if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.up)) {
        playerSnake.setDirectionUpLeft();
        socket.emit("input", { command: "up-left" });
      } else if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.down)) {
        playerSnake.setDirectionDownLeft();
        socket.emit("input", { command: "down-left" });
      } else {
        playerSnake.setDirectionLeft();
        socket.emit("input", { command: "left" });
      }
    });
    myKeyboard.register(MyGame.input.keys.up, () => {
      if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.left)) {
        playerSnake.setDirectionUpLeft();
        socket.emit("input", { command: "up-left" });
      } else if (myKeyboard.keys.hasOwnProperty(MyGame.input.keys.right)) {
        playerSnake.setDirectionUpRight();
        socket.emit("input", { command: "up-right" });
      } else {
        playerSnake.setDirectionUp();
        socket.emit("input", { command: "up" });
      }
    });
  }
  "use strict";

  let cancelNextRequest = true;
  const socket = io();
  let playerSnake = {};
  console.log("game initializing...");
  const otherSnakes = {};

  socket.on("connect-ack", () => {
    console.log("Connected to the Server!");
    socket.emit("join-request");
  });

  let context = graphics.getContext();

  let particle_system = particleSystem();
  let banana_particles = [];

  const yellowBunch = new Image();
  const redBunch = new Image();
  const blueBunch = new Image();
  const purpleBunch = new Image();
  const greenBunch = new Image();

  const yellowParticle = new Image();
  const redParticle = new Image();
  const blueParticle = new Image();
  const purpleParticle = new Image();
  const greenParticle = new Image();

  const dkhead = new Image();
  const dkbody = new Image();

  dkhead.onload = function () {
    dkhead.isReady = true;
    dkhead.subTextureWidth = dkhead.width;
  };
  dkhead.src = "assets/dkhead.png";

  dkbody.onload = function () {
    dkbody.isReady = true;
    dkbody.subTextureWidth = dkbody.width;
  };
  dkbody.src = "assets/dkbody.png";



  yellowParticle.onload = function () {
    yellowParticle.isReady = true;
    yellowParticle.subTextureWidth = yellowParticle.width;
  };
  yellowParticle.src = "assets/yellowParticle.png";

  redParticle.onload = function () {
    redParticle.isReady = true;
    redParticle.subTextureWidth = redParticle.width;
  };
  redParticle.src = "assets/redParticle.png";

  blueParticle.onload = function () {
    blueParticle.isReady = true;
    blueParticle.subTextureWidth = blueParticle.width;
  };
  blueParticle.src = "assets/blueParticle.png";

  purpleParticle.onload = function () {
    purpleParticle.isReady = true;
    purpleParticle.subTextureWidth = purpleParticle.width;
  };
  purpleParticle.src = "assets/purpleParticle.png";

  greenParticle.onload = function () {
    greenParticle.isReady = true;
    greenParticle.subTextureWidth = greenParticle.width;
  };
  greenParticle.src = "assets/greenParticle.png";



  yellowBunch.onload = function () {
    yellowBunch.isReady = true;
    yellowBunch.subTextureWidth = yellowBunch.width / BUNCH_SPRITE_COUNT;
  };
  yellowBunch.src = "assets/spritesheet-bananaYellowBunch.png";

  redBunch.onload = function () {
    redBunch.isReady = true;
    redBunch.subTextureWidth = redBunch.width / BUNCH_SPRITE_COUNT;
  };
  redBunch.src = "assets/spritesheet-bananaRedBunch.png";

  blueBunch.onload = function () {
    blueBunch.isReady = true;
    blueBunch.subTextureWidth = blueBunch.width / BUNCH_SPRITE_COUNT;
  };
  blueBunch.src = "assets/spritesheet-bananaBlueBunch.png";

  purpleBunch.onload = function () {
    purpleBunch.isReady = true;
    purpleBunch.subTextureWidth = purpleBunch.width / BUNCH_SPRITE_COUNT;
  };
  purpleBunch.src = "assets/spritesheet-bananaPurpleBunch.png";

  greenBunch.onload = function () {
    greenBunch.isReady = true;
    greenBunch.subTextureWidth = greenBunch.width / BUNCH_SPRITE_COUNT;
  };
  greenBunch.src = "assets/spritesheet-bananaGreenBunch.png";



  // This event should only be recieved after a join request event is emitted.
  socket.on("join", (data) => {
    playerSnake = objects.Snake({
      direction: data.rotation,
      center: {...data.position},
      headimage: dkhead,
      bodyimage: dkbody,
      moveRate: data.moveRate,
      rotateRate: data.rotateRate,
      segmentDistance: data.segmentDistance,
      startingSegments: data.startingSegments,
      headRenderer: dkHeadRender,
      bodyRenderer: dkBodyRender,
      score: 0,
      alive: true,
    });

    registerKeys();
    cancelNextRequest = false;
    requestAnimationFrame(gameLoop);
  });

  socket.on("connect_other", (data) => {
    const snake = data.snake;
    const newSnake = objects.Snake({
      direction: snake.head.rotation,
      center: snake.head.center,
      moveRate: snake.moveRate,
      rotateRate: snake.rotateRate,
      segmentDistance: snake.segmentDistance,
      startingSegments: snake.body.length,
      body: snake.body,
      headimage: dkhead,
      bodyimage: dkbody,
      headRenderer: dkHeadRender,
      bodyRenderer: dkBodyRender,
      alive: true,
    });

    otherSnakes[data.playerId] = newSnake;
  });

  socket.on("update_other", (data) => {
    console.log('desired in socket', data.desired);
    otherSnakes[data.player_id].setRotation(data.desired);
    console.log(otherSnakes[data.player_id].head);
  });

  let lastTimeStamp = performance.now();
  let myKeyboard = input.Keyboard();
  let timer = 0;
  let BANANA_EAT_TOL = 20;
  let BANANA_MAGNET_TOL = 75;

  const dkHeadRender = renderer.AnimatedModel(
    {
      spriteCount: 1,
      spriteTime: [1000], // ms per frame
    },
    graphics,
  );
  const dkBodyRender = renderer.AnimatedModel(
    {
      spriteCount: 1,
      spriteTime: [1000], // ms per frame
    },
    graphics,
  );


  const SINGLE_SPRITE_COUNT = 8;
  const BUNCH_SPRITE_COUNT = 12;

  let singleBananaRender = renderer.AnimatedModel(
    {
      spriteCount: SINGLE_SPRITE_COUNT,
      spriteTime: [150, 150, 150, 150, 150, 150, 150, 150], // ms per frame
    },
    graphics,
  );
  let bunchBananaRender = renderer.AnimatedModel(
    {
      spriteCount: BUNCH_SPRITE_COUNT,
      spriteTime: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], // ms per frame
    },
    graphics,
  );

  const yellowSingle = new Image();
  const redSingle = new Image();
  const blueSingle = new Image();
  const purpleSingle = new Image();
  const greenSingle = new Image();



  yellowSingle.onload = function () {
    yellowSingle.isReady = true;
    yellowSingle.subTextureWidth = yellowSingle.width / SINGLE_SPRITE_COUNT;
  };
  yellowSingle.src = "assets/spritesheet-bananaYellowSingle.png";

  redSingle.onload = function () {
    redSingle.isReady = true;
    redSingle.subTextureWidth = redSingle.width / SINGLE_SPRITE_COUNT;
  };
  redSingle.src = "assets/spritesheet-bananaRedSingle.png";

  blueSingle.onload = function () {
    blueSingle.isReady = true;
    blueSingle.subTextureWidth = blueSingle.width / SINGLE_SPRITE_COUNT;
  };
  blueSingle.src = "assets/spritesheet-bananaBlueSingle.png";

  purpleSingle.onload = function () {
    purpleSingle.isReady = true;
    purpleSingle.subTextureWidth = purpleSingle.width / SINGLE_SPRITE_COUNT;
  };
  purpleSingle.src = "assets/spritesheet-bananaPurpleSingle.png";

  greenSingle.onload = function () {
    greenSingle.isReady = true;
    greenSingle.subTextureWidth = greenSingle.width / SINGLE_SPRITE_COUNT;
  };
  greenSingle.src = "assets/spritesheet-bananaGreenSingle.png";

  let singleColorImages = [yellowSingle, redSingle, blueSingle, purpleSingle, greenSingle];
  let bunchColorImages = [yellowBunch, redBunch, blueBunch, purpleBunch, greenBunch];

  let particleColorImages = [yellowParticle, redParticle, blueParticle, purpleParticle, greenParticle];

  let bigFood = objects.Food({
    size: { x: 40, y: 40 }, // Size in pixels
    color: 0,
    image: bunchColorImages[0],
    center: { x: 50, y: 350 },
    rotation: 0,
  });

  let singleBananas = [];
  let bunchBananas = [bigFood];

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
    let hitHorizontalWall =
      snake.head.center.x < 0 ||
        snake.head.center.x > graphics.getCanvas().width;
    let hitVerticalWall =
      snake.head.center.y < 0 ||
        snake.head.center.y > graphics.getCanvas().height;
    if (hitHorizontalWall || hitVerticalWall) {
      snake.kill();
      createDeathBananas(snake);
    }
  }

  function magnetPull(snake, banana, elapsedTime) {
    banana.center.x += ((snake.head.center.x - banana.center.x) * elapsedTime / 150);
    banana.center.y += ((snake.head.center.y - banana.center.y) * elapsedTime / 150);
  }

  function testBananaCollision(snake, elapsedTime) {
    let newSingleBananas = [];
    let newBunchBananas = [];

    for (let banana of singleBananas) {
      if (Math.abs(snake.head.center.x - banana.center.x) < BANANA_MAGNET_TOL && Math.abs(snake.head.center.y - banana.center.y) < BANANA_MAGNET_TOL) {
        magnetPull(snake, banana, elapsedTime);
      }

      if (Math.abs(snake.head.center.x - banana.center.x) > BANANA_EAT_TOL || Math.abs(snake.head.center.y - banana.center.y) > BANANA_EAT_TOL) {
        newSingleBananas.push(banana);
      }

      else {
        snake.eatSingleBanana();
        particle_system.eatBanana(banana); }
    }
    singleBananas = newSingleBananas;

    for (let bunch of bunchBananas) {
      if (Math.abs(snake.head.center.x - bunch.center.x) < BANANA_MAGNET_TOL && Math.abs(snake.head.center.y - bunch.center.y) < BANANA_MAGNET_TOL) {
        magnetPull(snake, bunch, elapsedTime);
      }

      if (Math.abs(snake.head.center.x - bunch.center.x) > BANANA_EAT_TOL || Math.abs(snake.head.center.y - bunch.center.y) > BANANA_EAT_TOL) {
        newBunchBananas.push(bunch);
      }

      else {
        snake.eatBananaBunch();
        particle_system.eatBanana(bunch); }
    }
    bunchBananas = newBunchBananas;
  }

  // Currently spawns bananas on body segments only, no head
  function createDeathBananas(snake) {
    let bananaColor = Math.floor(Math.random() * 6);

    for (let segment of snake.body) {
      let deathBunch = objects.Food({
        size: { x: 40, y: 40 }, // Size in pixels
        image: bunchColorImages[bananaColor],
        center: { x: segment.center.x, y: segment.center.y },
        rotation: 0,
      });

      bunchBananas.push(deathBunch);
    }
  }

  function spawnNewBanana() {
    let bananaSpawnX = Math.random() * graphics.getCanvas().width;
    let bananaSpawnY = Math.random() * graphics.getCanvas().height;

    let bananaColor = Math.floor(Math.random() * 6);

    let newBanana = objects.Food({
      size: { x: 30, y: 30 },
      color: bananaColor,
      image: singleColorImages[bananaColor],
      center: { x: bananaSpawnX, y: bananaSpawnY },
      rotation: 0
    });

    singleBananas.push(newBanana);
  }

  function updateTime(elapsedTime) {
    timer += elapsedTime;
    if (timer >= 1000) {
      timer -= 1000;
      spawnNewBanana();
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

  function updateScore(elapsedTime) {
    document.getElementById("Score").textContent = "Score: " + playerSnake.score;
  }

  function update(elapsedTime) {
    updateFood(elapsedTime);
    updateTime(elapsedTime);
    updateScore(elapsedTime);
    updateParticles(elapsedTime);

    if (playerSnake.isAlive()) {
      testSnakeWallCollision(playerSnake);
      testBananaCollision(playerSnake, elapsedTime);
      playerSnake.update(elapsedTime);
    }

    for (const snake of Object.values(otherSnakes)) {
      snake.update(elapsedTime);
    }
  }

  function render() {
    graphics.clear();
    renderFood();
    renderParticles();

    // Render segments from last to first
    if (playerSnake.isAlive()) {
      playerSnake.render();
    }

    for (const snake of Object.values(otherSnakes)) {
      snake.render();
    }
  }

  myKeyboard.register("Escape", function () {
    cancelNextRequest = true;
    manager.showScreen("main-menu");
  });

  function start() {
    //socket.emit(NetworkAction.CLIENT_JOIN_REQUEST, {});
  }

  return {
    processInput: processInput,
    update: update,
    render: render,
    start: start,
    dkHead: playerSnake,
  };






  // Particle system - put in own file later

  function Particle(spec) {
    spec.size = { x: 30, y: 30 };
    spec.alive = 0;

    function update(elapsed_time) {
      //
      // We work with time in seconds, elapsedTime comes in as milliseconds
      elapsed_time = elapsed_time / 1000;
      //
      // Update how long it has been alive
      spec.alive += elapsed_time;

      //
      // Update its center
      spec.center.x += (elapsed_time * spec.speed * spec.direction.x);
      spec.center.y += (elapsed_time * spec.speed * spec.direction.y);

      //
      // Rotate proportional to its speed
      spec.rotation += (spec.speed / 500);

      //
      // Return true if this particle is still alive
      return (spec.alive < spec.lifetime);
    };

    let api = {
      update: update,
      get center() { return spec.center; },
      get size() { return spec.size; },
      get rotation() { return spec.rotation; },
      get age() { return spec.alive; },
      get image() { return spec.image; }
    };

    return api;
  }

  function particleSystem() {
    function eatBanana(banana) {
      // Generate some new particles
      for (let particle = 0; particle < 20; particle++) {
        let negX = Math.random() < 0.5 ? 1 : -1;
        let negY = Math.random() < 0.5 ? 1 : -1;
        let xDrift = (Math.random() / 2) * negX;
        let yDrift = (Math.random() / 2) * negY;
        let p = {
          center: {x: playerSnake.head.center.x, y: playerSnake.head.center.y},
          direction: { x: Math.random() * negX, y: Math.random() * negY},
          image: particleColorImages[banana.color],  // determinesColor
          speed: Math.random() * 600, // pixels per second
          rotation: playerSnake.head.direction,
          lifetime:  Math.random()    // seconds
        };
        banana_particles.push(Particle(p));
      }
    }

    /*
        function snakeCrash() {
            // Generate some new particles
            if (timerSeconds < 1 && timer < 100) {
                for (let particle = 0; particle < 8; particle++) {
                    let negX = Math.random() < 0.5 ? 1 : -1;
                    let negY = Math.random() < 0.5 ? 1 : -1;
                    let p = {
                        center: { x: texturePlayer.center.x + negX * 10 * Math.random(), y: texturePlayer.center.y + negY * 10 * Math.random()},
                        direction: { x: Math.random() * negX, y: Math.random() * negY},
                        speed: Math.random() * 200, // pixels per second
                        rotation: texturePlayer.rotation.angle,
                        lifetime:  Math.random() * 5    // seconds
                    };
                    death_particles.push(Particle(p));
                }
            }
        }
        */
    return {
      eatBanana: eatBanana,
      //snakeCrash: snakeCrash
    };
  }


  function updateParticles(elapsed_time) {
    let particle = 0;
    let aliveParticles = [];

    // Go through and update each of the currently alive particles
    aliveParticles.length = 0;
    for (particle = 0; particle < banana_particles.length; particle++) {
      // A return value of true indicates this particle is still alive
      if (banana_particles[particle].update(elapsed_time)) {
        aliveParticles.push(banana_particles[particle]);
      }
    }
    banana_particles = aliveParticles;
  }

  /*
    function updateDeathParticles(elapsed_time) {
        let particle = 0;
        let aliveParticles = [];

        // Go through and update each of the currently alive particles
        aliveParticles.length = 0;
        for (particle = 0; particle < death_particles.length; particle++) {
            // A return value of true indicates this particle is still alive
            if (death_particles[particle].update(elapsed_time)) {
                aliveParticles.push(death_particles[particle]);
            }
        }
        death_particles = aliveParticles;
    }
    */


  function renderParticles() {
    for (let particle = banana_particles.length - 1; particle >= 0; particle--) {
      let curr_particle = banana_particles[particle];
      if (curr_particle.image?.isReady) {
        let drawX = curr_particle.center.x - curr_particle.size.x / 2;
        let drawY = curr_particle.center.y - curr_particle.size.y / 2;
        let opacity = 1 - (2 * curr_particle.age);
        context.globalAlpha = Math.max(0, opacity);
        context.drawImage(curr_particle.image, drawX, drawY, curr_particle.size.x, curr_particle.size.y);
        context.globalAlpha = 1;
      }
    }
  }

  /*
    function renderDeathParticles() {
        for (let particle = death_particles.length - 1; particle >= 0; particle--) {
            if (death_particle.image.isReady) {
                drawX = death_particles[particle].center.x - death_particles[particle].size.x / 2;
                drawY = death_particles[particle].center.y - death_particles[particle].size.y / 2;
                opacity = 1 - (death_particles[particle].age);
                context.globalAlpha = Math.max(0, opacity);
                context.drawImage(death_particle.image, drawX, drawY, 2 * death_particles[particle].size.x, 2 * death_particles[particle].size.y);
                context.globalAlpha = 1;
            }
        }
    }
    */

};
