MyGame.main = function (objects, input, renderer, graphics) {
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



    const yellowBunch = new Image();
    const redBunch = new Image();
    const blueBunch = new Image();
    const purpleBunch = new Image();
    const greenBunch = new Image();

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
            direction: 3 * Math.PI / 2,
            center: { x: 500, y: 300 },
            headimage: dkhead,
            bodyimage: dkbody,
            moveRate: data.moveRate,
            rotateRate: data.rotateRate,
            segmentDistance: data.segmentDistance,
            startingSegments: 10,
            headRenderer: dkHeadRender,
            bodyRenderer: dkBodyRender,
            score: 0,
            alive: true,
        });

        myKeyboard.register(input.keys.up, playerSnake.setDirectionUp);
        myKeyboard.register(input.keys.down, playerSnake.setDirectionDown);
        myKeyboard.register(input.keys.left, playerSnake.setDirectionLeft);
        myKeyboard.register(input.keys.right, playerSnake.setDirectionRight);

        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    });

    socket.on("connect_other", (data) => {
        const snake = data.snake;
        const newSnake = objects.Snake({
            direction: snake.direction,
            center: snake.head.center,
            moveRate: snake.moveRate,
            rotateRate: snake.rotateRate,
            segmentDistance: snake.segmentDistance,
            startingSegments: snake.body.length,
            headRenderer: dkHeadRender,
            bodyRenderer: dkBodyRender,
            alive: true,
        });

        otherSnakes[data.playerId] = newSnake;
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

    let testFood = objects.Food({
        size: { x: 30, y: 30 }, // Size in pixels
        image: singleColorImages[0],
        center: { x: 50, y: 350 },
        rotation: 0,
    });

    let bigFood = objects.Food({
        size: { x: 40, y: 40 }, // Size in pixels
        image: bunchColorImages[0],
        center: { x: 50, y: 350 },
        rotation: 0,
    });

    let singleBananas = [testFood];
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

            else { snake.eatSingleBanana(); }
        }
        singleBananas = newSingleBananas;

        for (let bunch of bunchBananas) {
            if (Math.abs(snake.head.center.x - bunch.center.x) < BANANA_MAGNET_TOL && Math.abs(snake.head.center.y - bunch.center.y) < BANANA_MAGNET_TOL) {
                magnetPull(snake, bunch, elapsedTime);
            }

            if (Math.abs(snake.head.center.x - bunch.center.x) > BANANA_EAT_TOL || Math.abs(snake.head.center.y - bunch.center.y) > BANANA_EAT_TOL) {
                newBunchBananas.push(bunch);
            }

            else { snake.eatBananaBunch(); }
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
        MyGame.manager.showScreen("main-menu");
    });

    function start() {
        //socket.emit(NetworkAction.CLIENT_JOIN_REQUEST, {});
    }
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

    return {
        processInput: processInput,
        update: update,
        render: render,
        start: start,
        dkHead: playerSnake,
    };
};
