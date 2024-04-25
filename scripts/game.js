MyGame.main = function (objects, input, renderer, graphics) {
    const jungleJapes = new Audio("assets/audio/jungleJapesMusic.mp3");
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

    const dkTailRender = renderer.AnimatedModel(
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

    const SINGLE_SIZE = 30;
    const BUNCH_SIZE = 40;

    const WORLD_WIDTH = 4800;
    const WORLD_HEIGHT = 2600;

    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
    };

    let scores = [];

    socket.on("scoreboard", (data) => {
        scores = data.scores;
    });

    // This event should only be recieved after a join request event is emitted.
    socket.on("join", (data) => {
        playerSnake = objects.Snake(
            { ...data.position }, // center
            data.rotation, // direction
            data.moveRate, // moveRate
            data.rotateRate, // rotateRate
            data.rotationTolerance,
            data.renderSize,
            data.invincibilityTimeLeft,
            localStorage.getItem("name"),
            dkHeadRender,
            dkBodyRender,
            dkTailRender,
            dkhead, // Head Image
            dkbodyGold, // Body Image
            dktail,
            data.startingSegments,
            0, // Score
        );

        singleBananas = [];

        for (const banana of data.single_bananas) {
            singleBananas.push(
                objects.Food({
                    size: { x: SINGLE_SIZE, y: SINGLE_SIZE },
                    color: banana.bananaColor,
                    image: singleColorImages[banana.bananaColor],
                    center: { x: banana.bananaX, y: banana.bananaY },
                    rotation: 0,
                    id: banana.id,
                }),
            );
        }

        bunchBananas = [];

        for (const bunch of data.bunch_bananas) {
            bunchBananas.push(
                objects.Food({
                    size: { x: BUNCH_SIZE, y: BUNCH_SIZE },
                    color: bunch.bananaColor,
                    image: bunchColorImages[bunch.bananaColor],
                    center: { x: bunch.bananaX, y: bunch.bananaY },
                    rotation: 0,
                    id: bunch.id,
                }),
            );
        }

        particle_system = particleSystem(playerSnake);
        registerKeys();
        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    });

    socket.on("update_head", (data) => {
        playerSnake.center = data.position;
        playerSnake.adjustPosition({
            x: data.position.x - playerSnake.center.x,
            y: data.position.y - playerSnake.center.y,
        });
    });

    socket.on("grow_snake", (data) => {
        playerSnake.body.push(
            createBody({ ...data.center }, [...inflection_points]),
        );
    });

    socket.on("grow_other", (data) => {
        if (!otherSnakes[data.player_id]) return;
        !otherSnakes[data.player_id].body.push(
            createBody({ ...data.center }, [...inflection_points]),
        );
    });

    socket.on("update_body", (data) => {
        if (data.client_id === socket.id) {
            playerSnake.repositionBody(data.body);
        } else {
            if (otherSnakes[data.client_id]) {
                otherSnakes[data.client_id].repositionBody(data.body);
            }
        }
    });

    socket.on("connect_other", (data) => {
        const snake = data.snake;
        const newSnake = objects.Snake(
            snake.center,
            snake.direction,
            snake.moveRate,
            snake.rotateRate,
            snake.rotationTolerance,
            snake.renderSize,
            snake.invincibilityTimeLeft,
            snake.name,
            dkHeadRender,
            dkBodyRender,
            dkTailRender,
            dkhead, // Head Image
            dkbodyRed, // Body Image
            dktail,
            //segmentDistance: snake.segmentDistance,
            snake.body.length,
            snake.score,
            snake.body,
        );

        otherSnakes[data.playerId] = newSnake;
    });

    socket.on("disconnect_other", (data) => {
        if (otherSnakes[data.clientId]) {
            delete otherSnakes[data.clientId];
        }
    });

    socket.on("add_turn", (data) => {
        playerSnake.addTurnPoint(data.turnPoint);
    });

    socket.on("add_other_turn", (data) => {
        if (!otherSnakes[data.player_id]) return;
        otherSnakes[data.player_id].addTurnPoint(data.turnPoint);
    });

    socket.on("eat_single", (data) => {
        const banana = singleBananas.findIndex(
            (nana) => data.banana_id === nana.id,
        );

        if (banana === -1) return;

        particle_system.eatBanana(singleBananas[banana]);
        singleBananas.splice(banana, 1);

        if (data.snake_id === socket.id) {
            playerSnake.eatSingleBanana();
        } else {
            otherSnakes[data.snake_id].eatSingleBanana();
        }
    });

    socket.on("eat_bunch", (data) => {
        const banana = bunchBananas.findIndex(
            (nana) => data.banana_id === nana.id,
        );

        if (banana === -1) return;

        particle_system.eatBanana(bunchBananas[banana]);

        bunchBananas.splice(banana, 1);

        if (data.snake_id === socket.id) {
            playerSnake.eatBananaBunch();
        } else {
            otherSnakes[data.snake_id].eatBananaBunch();
        }
    });

    socket.on("new_single", (data) => {
        singleBananas.push(
            objects.Food({
                size: { x: SINGLE_SIZE, y: SINGLE_SIZE },
                color: data.bananaColor,
                image: singleColorImages[data.bananaColor],
                center: { x: data.bananaSpawnX, y: data.bananaSpawnY },
                rotation: 0,
                id: data.id,
            }),
        );
    });

    socket.on("new_bunch", (data) => {
        bunchBananas.push(
            objects.Food({
                size: { x: BUNCH_SIZE, y: BUNCH_SIZE },
                color: data.bananaColor,
                image: bunchColorImages[data.bananaColor],
                center: { x: data.bananaSpawnX, y: data.bananaSpawnY },
                rotation: 0,
                id: data.id,
            }),
        );
    });

    socket.on("snake_kill", (data) => {
        playerSnake.kill();
        particle_system.snakeCrash();
    });

    socket.on("kill_pt", (data) => {
        if (data.name === playerSnake.name) {
            playerSnake.kills++;
        }
    });

    socket.on("other_snake_kill", (data) => {
        if (otherSnakes[data.snake_id]) {
            otherSnakes[data.snake_id].kill();
            //particle_system.snakeCrash();
        }
    });

    let magneted_bananas = [];
    socket.on("magnet_pull", (data) => {
        magneted_bananas.push(data);
    });

    socket.on("add_body", (data) => {
        playerSnake.body.push(
            createBody({ ...data.piece.center }, [
                ...data.piece.inflection_points,
            ]),
        );
    });

    socket.on("add_other_body", (data) => {
        if (!otherSnakes[data.player_id]) return;
        otherSnakes[data.player_id].body.push(
            createBody({ ...data.piece.center }, [
                ...data.piece.inflection_points,
            ]),
        );
    });

    socket.on("update_other_head", (data) => {
        if (!otherSnakes[data.player_id]) return;
        otherSnakes[data.player_id].center = data.position;
    });

    socket.on("update_other", (data) => {
        if (!otherSnakes[data.player_id]) return;
        otherSnakes[data.player_id].setRotation(data.desired);
    });

    let lastTimeStamp = performance.now();
    let myKeyboard = input.Keyboard();

    let singleBananas = [];
    let bunchBananas = [];

    startMusic();

    function startMusic() {
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

    function update(elapsedTime) {
        updateFood(elapsedTime);
        updateParticles(elapsedTime);
        updateCamera();

        const magnet_now = [...magneted_bananas];
        magneted_bananas = [];
        for (const magneted of magnet_now) {
            let banana = singleBananas.find(
                (nana) => magneted.banana_id === nana.id,
            );
            if (!banana) {
                banana = bunchBananas.find(
                    (nana) => magneted.banana_id === nana.id,
                );
            }
            if (!banana) {
                continue;
            }
            magnetPull(
                magneted.pullLoc.x,
                magneted.pullLoc.y,
                banana,
                elapsedTime,
            );
        }

        if (playerSnake.isAlive()) {
            playerSnake.update(elapsedTime);
            if (playerSnake.isInvincible()) {
                particle_system.invincibility(
                    playerSnake.invincibilityTimeLeft,
                );
            }
        }

        for (const snake of Object.values(otherSnakes)) {
            if (snake.isAlive()) {
                snake.update(elapsedTime);
            }
        }
    }

    let scoreLogged = false;

    function render() {
        graphics.clear();

        context.translate(-camera.x, -camera.y);
        renderBackground();
        renderFood();
        renderParticles(context);

        // Render segments from last to first
        if (playerSnake.isAlive()) {
            renderSnake(playerSnake);
        }

        for (const snake of Object.values(otherSnakes)) {
            if (snake.isAlive()) {
                renderSnake(snake);
            }
        }

        context.translate(camera.x, camera.y);

        renderScoreboard(playerSnake, scores);

        if (!playerSnake.isAlive()) {
            renderKillScreen();
            if (!scoreLogged) {
                if (localStorage.getItem("scores")) {
                    let scoresList = localStorage.getItem("scores").split(" ");
                    scoresList.push(playerSnake.score.toString());
                    scoresList.sort((a, b) => {
                        return parseInt(b, 10) - parseInt(a, 10);
                    });
                    if (scoresList.length > 5) {
                        scoresList.pop();
                    }

                    localStorage.setItem("scores", scoresList.join(" "));
                } else {
                    localStorage.setItem(
                        "scores",
                        playerSnake.score.toString(),
                    );
                }
                var button = document.getElementById("id-game-back");
                button.style.display = "block";
                button.style.marginLeft = "auto";
                button.style.marginRight = "auto";
                scoreLogged = true;
            }
        }
    }

    function renderSnake(snake) {
        context.globalAlpha = 1 - snake.invincibilityTimeLeft / 5000;
        snake.render();
        context.globalAlpha = 1;
    }

    function renderKillScreen() {
        if (killScreenImage.isReady) {
            context.globalAlpha = 0.95;

            context.drawImage(
                killScreenImage,
                50,
                50,
                killScreenImage.width,
                killScreenImage.height,
            );

            context.globalAlpha = 1;

            MyGame.graphics.drawText(890, 160, "", "white");
            MyGame.graphics.drawText(890, 160, "Score", "white");
            MyGame.graphics.drawText(890, 200, playerSnake.score, "white");
            MyGame.graphics.drawText(890, 280, "Kills", "white");
            MyGame.graphics.drawText(890, 320, playerSnake.kills, "white");
            MyGame.graphics.drawText(890, 400, "Top Position", "white");
            MyGame.graphics.drawText(890, 440, playerSnake.topPos, "white");
        }
    }

    function start() {
        console.log("yarg");
        socket.emit("join-request", {
            name: localStorage.getItem("name"),
        });
    }

    function magnetPull(x, y, banana, elapsedTime) {
        banana.center.x += ((x - banana.center.x) * elapsedTime) / 200;
        banana.center.y += ((y - banana.center.y) * elapsedTime) / 200;
    }

    function updateCamera() {
        // Adjust camera position based on player's position
        camera.x = playerSnake.center.x - camera.width / 2;
        camera.y = playerSnake.center.y - camera.height / 2;

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

    myKeyboard.register("Escape", function () {
        jungleJapes.pause();
        cancelNextRequest = true;
        socket.emit("quit");
        MyGame.manager.showScreen("main-menu");
    });

    document
        .getElementById("id-game-back")
        .addEventListener("click", function () {
            jungleJapes.pause();
            cancelNextRequest = true;
            socket.emit("quit");
            MyGame.manager.showScreen("main-menu");
        });

    return {
        processInput: processInput,
        update: update,
        render: render,
        start: start,
        jungleJapes: jungleJapes,
        cancelNextRequest: cancelNextRequest,
        socket: socket,
        dkHead: playerSnake,
    };
};
