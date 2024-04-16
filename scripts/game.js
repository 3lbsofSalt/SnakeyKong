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

    // This event should only be recieved after a join request event is emitted.
    socket.on("join", (data) => {
        playerSnake = objects.Snake({
            direction: data.rotation,
            center: { x: 100, y: 200 },
            moveRate: data.moveRate,
            rotateRate: data.rotateRate,
            segmentDistance: data.segmentDistance,
            startingSegments: 3,
            headRenderer: dkHeadRender,
            bodyRenderer: dkBodyRender,
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
        manager.showScreen("main-menu");
    });

    function start() {
        console.log("yarg");
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
