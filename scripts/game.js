MyGame.main = function (objects, input, renderer, graphics) {
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
            spriteTime: [
                100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
            ], // ms per frame
        },
        graphics,
    );

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

    function registerKeys() {
        myKeyboard.register(" ", () => {
            console.log(playerSnake);
            debugger;
        });
        myKeyboard.register(input.keys.right, () => {
            if (myKeyboard.keys.hasOwnProperty(input.keys.up)) {
                playerSnake.setDirectionUpRight();
                socket.emit("input", { command: "up-right" });
            } else if (myKeyboard.keys.hasOwnProperty(input.keys.down)) {
                playerSnake.setDirectionDownRight();
                socket.emit("input", { command: "down-right" });
            } else {
                playerSnake.setDirectionRight();
                socket.emit("input", { command: "right" });
            }
        });
        myKeyboard.register(input.keys.down, () => {
            if (myKeyboard.keys.hasOwnProperty(input.keys.left)) {
                playerSnake.setDirectionDownLeft();
                socket.emit("input", { command: "down-left" });
            } else if (myKeyboard.keys.hasOwnProperty(input.keys.right)) {
                playerSnake.setDirectionDownRight();
                socket.emit("input", { command: "down-right" });
            } else {
                playerSnake.setDirectionDown();
                socket.emit("input", { command: "down" });
            }
        });
        myKeyboard.register(input.keys.left, () => {
            if (myKeyboard.keys.hasOwnProperty(input.keys.up)) {
                playerSnake.setDirectionUpLeft();
                socket.emit("input", { command: "up-left" });
            } else if (myKeyboard.keys.hasOwnProperty(input.keys.down)) {
                playerSnake.setDirectionDownLeft();
                socket.emit("input", { command: "down-left" });
            } else {
                playerSnake.setDirectionLeft();
                socket.emit("input", { command: "left" });
            }
        });
        myKeyboard.register(input.keys.up, () => {
            if (myKeyboard.keys.hasOwnProperty(input.keys.left)) {
                playerSnake.setDirectionUpLeft();
                socket.emit("input", { command: "up-left" });
            } else if (myKeyboard.keys.hasOwnProperty(input.keys.right)) {
                playerSnake.setDirectionUpRight();
                socket.emit("input", { command: "up-right" });
            } else {
                playerSnake.setDirectionUp();
                socket.emit("input", { command: "up" });
            }
        });
    }
    ("use strict");

    let cancelNextRequest = true;
    const socket = io();
    let playerSnake = {};
    const otherSnakes = {};
    console.log("game initializing...");

    socket.on("connect-ack", () => {
        console.log("Connected to the Server!");
    });

    const canvas = graphics.getCanvas();
    const context = graphics.getContext();

    let particle_system = particleSystem(playerSnake);

    const WORLD_WIDTH = 4800;
    const WORLD_HEIGHT = 2600;

    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
    };

    // This event should only be recieved after a join request event is emitted.
    socket.on("join", (data) => {
        playerSnake = objects.Snake({
            direction: data.rotation,
            center: { ...data.position },
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
            name: localStorage.getItem("name"),
        });

        for (const banana of data.single_bananas) {
            console.log(banana);
            singleBananas.push(
                objects.Food({
                    size: { x: 30, y: 30 },
                    color: banana.bananaColor,
                    image: singleColorImages[banana.bananaColor],
                    center: { x: banana.bananaX, y: banana.bananaY },
                    rotation: 0,
                    id: banana.id,
                }),
            );
        }

        particle_system = particleSystem(playerSnake);
        registerKeys();
        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    });

    socket.on("connect_other", (data) => {
        const snake = data.snake;
        console.log(snake.head.center);
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
            name: snake.name,
        });

        otherSnakes[data.playerId] = newSnake;
    });

    socket.on("eat_single", (data) => {
        console.log("yary");
        const banana = singleBananas.findIndex(
            (nana) => data.banana_id === nana.id,
        );

        if (banana === -1) return;

        particle_system.eatBanana(singleBananas[banana]);

        singleBananas.splice(banana, 1);

        if (data.snake_id === socket.id) {
            playerSnake.eatSingleBanana();
        }
    });

    socket.on("new_single", (data) => {
        singleBananas.push(
            objects.Food({
                size: { x: 30, y: 30 },
                color: data.bananaColor,
                image: singleColorImages[data.bananaColor],
                center: { x: data.bananaSpawnX, y: data.bananaSpawnY },
                rotation: 0,
                id: data.id,
            }),
        );
    });

    let magneted_bananas = [];
    socket.on("magnet_pull", (data) => {
        magneted_bananas.push(data);
    });

    socket.on("update_other", (data) => {
        otherSnakes[data.player_id].setRotation(data.desired);
    });

    let lastTimeStamp = performance.now();
    let myKeyboard = input.Keyboard();

    let singleBananas = [];
    let bunchBananas = [];

    startMusic();

    function startMusic() {
        let jungleJapes = new Audio("assets/audio/jungleJapesMusic.mp3");
        jungleJapes.play();
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    const UPDATE_RATE_MS = 30;

    function gameLoop(time) {
        let elapsed = time - lastTimeStamp;
        processInput(elapsed);
        update(elapsed);
        render();
        lastTimeStamp = time;

        if (!cancelNextRequest) {
            setTimeout(
                () => {
                    requestAnimationFrame(gameLoop);
                },
                UPDATE_RATE_MS - (performance.now() - time),
            );
        }
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

    function renderBackground() {
        if (backgroundImage.isReady) {
            context.drawImage(
                backgroundImage,
                0,
                0,
                backgroundImage.width,
                backgroundImage.height,
            );
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
        document.getElementById("Score").textContent =
            "Score: " + playerSnake.score;
    }

    function update(elapsedTime) {
        updateFood(elapsedTime);
        updateScore(elapsedTime);
        updateParticles(elapsedTime);
        updateCamera();

        const magnet_now = [...magneted_bananas];
        magneted_bananas = [];
        for (const magneted of magnet_now) {
            const banana = singleBananas.find(
                (nana) => magneted.banana_id === nana.id,
            );
            if (!banana) continue;
            magnetPull(
                magneted.pullLoc.x,
                magneted.pullLoc.y,
                banana,
                elapsedTime,
            );
        }

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

        context.translate(-camera.x, -camera.y);
        renderBackground();
        renderFood();
        renderParticles(context);

        // Render segments from last to first
        if (playerSnake.isAlive()) {
            playerSnake.render();
        }

        for (const snake of Object.values(otherSnakes)) {
            snake.render();
        }

        context.translate(camera.x, camera.y);
    }

    function testSnakeWallCollision(snake) {
        let hitHorizontalWall =
            snake.head.center.x < 0 || snake.head.center.x > WORLD_WIDTH;
        let hitVerticalWall =
            snake.head.center.y < 0 || snake.head.center.y > WORLD_HEIGHT;
        if (hitHorizontalWall || hitVerticalWall) {
            snake.kill();
            createDeathBananas(snake);
            particle_system.snakeCrash(playerSnake);
        }
    }

    myKeyboard.register("Escape", function () {
        cancelNextRequest = true;
        manager.showScreen("main-menu");
    });

    function start() {
        socket.emit("join-request", {
            name: localStorage.getItem("name"),
        });
    }

    // Particle system - put in own file later
    function magnetPull(x, y, banana, elapsedTime) {
        banana.center.x += ((x - banana.center.x) * elapsedTime) / 150;
        banana.center.y += ((y - banana.center.y) * elapsedTime) / 150;
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

    function updateFood(elapsedTime) {
        singleBananaRender.update(elapsedTime);
        bunchBananaRender.update(elapsedTime);
    }

    function updateCamera() {
        // Adjust camera position based on player's position
        camera.x = playerSnake.head.center.x - camera.width / 2;
        camera.y = playerSnake.head.center.y - camera.height / 2;

        // Ensure camera doesn't go out of bounds
        if (camera.x < 0) {
            camera.x = 0;
        }
        if (camera.y < 0) {
            camera.y = 0;
        }
        if (camera.x + camera.width > WORLD_WIDTH) {
            camera.x = WORLD_WIDTH - camera.width;
        }
        if (camera.y + camera.height > WORLD_HEIGHT) {
            camera.y = WORLD_HEIGHT - camera.height;
        }
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
        document.getElementById("Score").textContent =
            "Score: " + playerSnake.score;
    }

    myKeyboard.register("Escape", function () {
        cancelNextRequest = true;
        MyGame.manager.showScreen("main-menu");
    });

    return {
        processInput: processInput,
        update: update,
        render: render,
        start: start,
        dkHead: playerSnake,
    };
};
