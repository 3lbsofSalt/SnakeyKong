MyGame.main = function (objects, input, renderer, graphics) {
    "use strict";

    let cancelNextRequest = true;
    const socket = io();
    let playerSnake = {};
    console.log("game initializing...");
    const otherSnakes = [];

    socket.on("connect-ack", () => {
        console.log("Connected to the Server!");
        socket.emit("join-request");
    });

    // This event should only be recieved after a join request event is emitted.
    socket.on("join", (data) => {
        playerSnake = objects.Snake({
            direction: 3 * Math.PI / 2,
            center: { x: 500, y: 300 },
            moveRate: data.moveRate,
            rotateRate: data.rotateRate,
            segmentDistance: data.segmentDistance,
            startingSegments: 10,
            keyboard: myKeyboard,
            headRenderer: dkHeadRender,
            bodyRenderer: dkBodyRender,
            alive: true,
        });

        console.log(input.keys.up);
        myKeyboard.register(input.keys.up, playerSnake.setDirectionUp);
        myKeyboard.register(input.keys.down, playerSnake.setDirectionDown);
        myKeyboard.register(input.keys.left, playerSnake.setDirectionLeft);
        myKeyboard.register(input.keys.right, playerSnake.setDirectionRight);

        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    });
    /*

  socket.on(NetworkAction.CONNECT_OTHER, data => {

  });
  */

    let lastTimeStamp = performance.now();
    let myKeyboard = input.Keyboard();
    let timer = 0;
    let BANANA_EAT_TOL = 20;
    let BANANA_MAGNET_TOL = 75;

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


    let singleBananas = [littleFood, littleFood2];
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
        }
        singleBananas = newSingleBananas;

        for (let bunch of bunchBananas) {
            if (Math.abs(snake.head.center.x - bunch.center.x) < BANANA_MAGNET_TOL && Math.abs(snake.head.center.y - bunch.center.y) < BANANA_MAGNET_TOL) {
                magnetPull(snake, bunch, elapsedTime);
            }

            if (Math.abs(snake.head.center.x - bunch.center.x) > BANANA_EAT_TOL || Math.abs(snake.head.center.y - bunch.center.y) > BANANA_EAT_TOL) {
                newBunchBananas.push(bunch);
            }
        }
        bunchBananas = newBunchBananas;
    }

    // Currently spawns bananas on body segments only, no head
    function createDeathBananas(snake) {
        for (let segment of snake.body) {
            let deathBunch = objects.Food({
                size: { x: 40, y: 40 }, // Size in pixels
                center: { x: segment.center.x, y: segment.center.y },
                rotation: 0,
            });

            bunchBananas.push(deathBunch);
        }
    }

    function spawnNewBanana() {
        let bananaSpawnX = Math.random() * graphics.getCanvas().width;
        let bananaSpawnY = Math.random() * graphics.getCanvas().height;

        let newBanana = objects.Food({
            size: { x: 30, y: 30 },
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

    function update(elapsedTime) {
        updateFood(elapsedTime);
        updateTime(elapsedTime)

        if (playerSnake.isAlive()) {
            testSnakeWallCollision(playerSnake);
            testBananaCollision(playerSnake, elapsedTime);
            playerSnake.update(elapsedTime);
        }
    }

    function render() {
        graphics.clear();
        renderFood();

        // Render segments from last to first
        if (playerSnake.isAlive()) {
            playerSnake.render();
        }
    }

    myKeyboard.register("Escape", function () {
        cancelNextRequest = true;
        manager.showScreen("main-menu");
    });

    function start() {
        console.log("yarg");
        //socket.emit(NetworkAction.CLIENT_JOIN_REQUEST, {});
    }
    myKeyboard.register(MyGame.input.keys.up, playerSnake.setDirectionUp);
    myKeyboard.register(MyGame.input.keys.down, playerSnake.setDirectionDown);
    myKeyboard.register(MyGame.input.keys.left, playerSnake.setDirectionLeft);
    myKeyboard.register(MyGame.input.keys.right, playerSnake.setDirectionRight);

    return {
        processInput: processInput,
        update: update,
        render: render,
        start: start,
        dkHead: playerSnake,
    };
};
