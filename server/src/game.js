const NetworkAction = require("./shared/NetworkActions.js");
const present = require("present");

const { createPlayer } = require("./objects/Player.js");

let singleBananas = [];
let bunchBananas = [];

const WORLD_WIDTH = 4800;
const WORLD_HEIGHT = 2600;
const BANANA_SPAWN_TIME = 500;

// const BANANA_EAT_TOL = 50;
//const BANANA_MAGNET_TOL = 75;
// const BANANA_MAGNET_TOL = 50;

let timer = 0;
let positionTimer = 0;
let scoreTimer = 500;

const segmentDistance = 30;
const rotateRate = Math.PI / 1000; // Radians per second
const moveRate = 200 / 1000; // Pixels per second
const initialRenderSize = 50;
const UPDATE_RATE_MS = 30;
let inputQueue = [];
let updateQueue = [];

const activeClients = {};
let quit = false;

function initializeSocketIO(server) {
    const io = require("socket.io")(server);

    function notifyConnect(socket, newPlayer) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                client.socket.emit("connect_other", {
                    snake: newPlayer.snake,
                    playerId: socket.id,
                });

                socket.emit("connect_other", {
                    playerId: client.socket.id,
                    snake: client.player.snake,
                });
            }
        }
    }

    function notifyDisconnect(playerId) {
        for (const clientId in activeClients) {
            let client = activeClients[clientId];
            if (playerId !== clientId) {
                console.log("yarg");
                client.socket.emit("disconnect_other", {
                    clientId: playerId,
                });
            }
        }
    }

    io.on("connection", function (socket) {
        console.log("Connection established: ", socket.id);

        socket.emit("connect-ack", {});

        socket.on("join-request", function (data) {
            const newPlayer = createPlayer(
                socket.id,
                moveRate,
                rotateRate,
                segmentDistance,
                initialRenderSize,
                data.name,
            );
            activeClients[socket.id] = {
                socket: socket,
                player: newPlayer,
            };

            socket.emit("join", {
                position: {
                    x: newPlayer.snake.center.x,
                    y: newPlayer.snake.center.y,
                },
                rotation: newPlayer.snake.direction,
                moveRate,
                rotateRate,
                rotationTolerance: newPlayer.snake.rotationTolerance,
                renderSize: initialRenderSize,
                segmentDistance,
                startingSegments: 3,
                single_bananas: singleBananas,
                bunch_bananas: bunchBananas,
                alive: true,
            });

            notifyConnect(socket, newPlayer);
        });

        socket.on("disconnect", function () {
            delete activeClients[socket.id];
            console.log("Player " + socket.id + " disconnected");
            inputQueue = [
                ...inputQueue.filter((input) => input.clientId !== socket.id),
            ];
            notifyDisconnect(socket.id);
        });

        socket.on("input", (data) => {
            inputQueue.push({
                clientId: socket.id,
                message: data,
            });
        });
    });
}

function processInput(elapsedTime) {
    const processNow = [...inputQueue];
    inputQueue = [];

    while (processNow.length) {
        const input = processNow.shift();
        if (!input) continue;
        const client = activeClients[input.clientId];
        if (!client) continue;
        switch (input.message.command) {
            case "down":
                client.player.snake.setDirectionDown();
                break;
            case "up":
                client.player.snake.setDirectionUp();
                break;
            case "right":
                client.player.snake.setDirectionRight();
                break;
            case "left":
                client.player.snake.setDirectionLeft();
                break;
            case "up-left":
                client.player.snake.setDirectionUpLeft();
                break;
            case "down-left":
                client.player.snake.setDirectionDownLeft();
                break;
            case "up-right":
                client.player.snake.setDirectionUpRight();
                break;
            case "down-right":
                client.player.snake.setDirectionDownRight();
                break;
        }
        updateQueue.push({
            type: "input",
            player_id: client.socket.id,
            desired: client.player.snake.desiredDirection,
            turnPoint: { ...client.player.snake.center },
        });

        client.player.snake.addTurnPoint({ ...client.player.snake.center });
    }
}

function informClientPosition() {
    for (const clientId in activeClients) {
        const client = activeClients[clientId];

        updateQueue.push({
            type: "head_position",
            player_id: clientId,
            position: { ...client.player.snake.center },
        });
    }
}

let food_id = 0;

function spawnNewBanana() {
    if (singleBananas.length >= 1000) return;
    let bananaSpawnX = Math.random() * WORLD_WIDTH;
    let bananaSpawnY = Math.random() * WORLD_HEIGHT;
    let bananaColor = Math.floor(Math.random() * 6);
    food_id++;

    const banana = {
        bananaX: bananaSpawnX,
        bananaY: bananaSpawnY,
        bananaColor,
        id: food_id,
    };

    singleBananas.push(banana);

    updateQueue.push({
        type: "new_single",
        bananaSpawnX,
        bananaSpawnY,
        bananaColor,
        id: food_id,
    });
}

function spawnNewBunch() {
    let bananaSpawnX = Math.random() * WORLD_WIDTH;
    let bananaSpawnY = Math.random() * WORLD_HEIGHT;
    let bananaColor = Math.floor(Math.random() * 6);
    food_id++;

    const banana = {
        bananaX: bananaSpawnX,
        bananaY: bananaSpawnY,
        bananaColor,
        id: food_id,
    };

    bunchBananas.push(banana);

    updateQueue.push({
        type: "new_bunch",
        bananaSpawnX,
        bananaSpawnY,
        bananaColor,
        id: food_id,
    });
}

function testSnakeWallCollision(snake, clientId) {
    if (snake.isAlive()) {
        let hitHorizontalWall =
            snake.center.x < 0 || snake.center.x > WORLD_WIDTH;
        let hitVerticalWall =
            snake.center.y < 0 || snake.center.y > WORLD_HEIGHT;
        if (hitHorizontalWall || hitVerticalWall) {
            snake.kill();
            createDeathBananas(snake);
            updateQueue.push({
                type: "snake_kill",
                snake_id: clientId,
            });
        }
    }
}

function snakeHitOtherSnakeHead(snake, otherSnake) {
    let tooCloseX =
        Math.abs(snake.center.x - otherSnake.center.x) <
        otherSnake.renderSize / 2;
    let tooCloseY =
        Math.abs(snake.center.y - otherSnake.center.y) <
        otherSnake.renderSize / 2;
    if (tooCloseX && tooCloseY) {
        return true;
    }
    return false;
}

function snakeHitOtherSnakeBody(snake, otherSnake) {
    for (segment of otherSnake.body) {
        let tooCloseX =
            Math.abs(snake.center.x - segment.center.x) <
            otherSnake.renderSize / 2;
        let tooCloseY =
            Math.abs(snake.center.y - segment.center.y) <
            otherSnake.renderSize / 2;
        if (tooCloseX && tooCloseY) {
            return true;
        }
    }
    return false;
}

function testSnakeCollision(snake, clientId) {
    // For every snake in the lobby...
    for (const [id, activeClient] of Object.entries(activeClients)) {
        // ...except for yourself (also make sure the other snake is alive)...
        if (clientId != id && activeClient.player.snake.isAlive()) {
            otherSnake = activeClient.player.snake;
            // ...check and see if you have collided into a part of the other snake
            if (snakeHitOtherSnakeHead(snake, otherSnake)) {
                snake.kill();
                createDeathBananas(snake);
                updateQueue.push({
                    type: "snake_kill",
                    snake_id: clientId,
                });

                otherSnake.kill();
                createDeathBananas(otherSnake);
                updateQueue.push({
                    type: "snake_kill",
                    snake_id: id,
                });
            } else if (snakeHitOtherSnakeBody(snake, otherSnake)) {
                snake.kill();
                createDeathBananas(snake);
                updateQueue.push({
                    type: "snake_kill",
                    snake_id: clientId,
                });
            }
        }
    }
}

function testBananaCollision(snake, elapsedTime, clientId) {
    // Have to test if the snake is alive so a snake can't eat their own banana bunches upon death
    if (snake.isAlive()) {
        let newSingleBananas = [];
        let newBunchBananas = [];
        let banana_magnet_tol = snake.renderSize;
        let banana_eat_tol = snake.renderSize;

        for (let banana of singleBananas) {
            // pull in banana
            if (
                Math.abs(snake.center.x - banana.bananaX) < banana_magnet_tol &&
                Math.abs(snake.center.y - banana.bananaY) < banana_magnet_tol
            ) {
                magnetPull(snake.center.x, snake.center.y, banana, elapsedTime);
            }

            if (
                Math.abs(snake.center.x - banana.bananaX) > banana_eat_tol ||
                Math.abs(snake.center.y - banana.bananaY) > banana_eat_tol
            ) {
                newSingleBananas.push(banana);
                // eat banana
            } else {
                const client = activeClients[clientId];
                client.player.snake.eatSingleBanana();
                if (client.player.snake.needsNewBodyPiece()) {
                    client.player.snake.addBodyPiece();
                    updateQueue.push({
                        type: "add_body",
                        player_id: clientId,
                        piece: client.player.snake.body[
                            client.player.snake.body.length - 1
                        ],
                    });
                }
                updateQueue.push({
                    type: "eat_single",
                    banana_id: banana.id,
                    snake_id: clientId,
                });
            }
        }
        singleBananas = newSingleBananas;

        for (let bunch of bunchBananas) {
            if (
                Math.abs(snake.center.x - bunch.bananaX) < banana_magnet_tol &&
                Math.abs(snake.center.y - bunch.bananaY) < banana_magnet_tol
            ) {
                //console.log("MAGNETING BUNCH!");
                magnetPull(snake.center.x, snake.center.y, bunch, elapsedTime);
            }

            if (
                Math.abs(snake.center.x - bunch.bananaX) > banana_eat_tol ||
                Math.abs(snake.center.y - bunch.bananaY) > banana_eat_tol
            ) {
                newBunchBananas.push(bunch);
            } else {
                const client = activeClients[clientId];
                client.player.snake.eatBananaBunch();
                if (client.player.snake.needsNewBodyPiece()) {
                    client.player.snake.addBodyPiece();
                    updateQueue.push({
                        type: "add_body",
                        player_id: clientId,
                        piece: client.player.snake.body[
                            client.player.snake.body.length - 1
                        ],
                    });
                }
                updateQueue.push({
                    type: "eat_bunch",
                    banana_id: bunch.id,
                    snake_id: clientId,
                });
            }
        }
        bunchBananas = newBunchBananas;
    }
}

function createDeathBananas(snake) {
    let bananaColor = Math.floor(Math.random() * 6);

    for (let segment of snake.body) {
        let bananaSpawnX = segment.center.x;
        let bananaSpawnY = segment.center.y;
        food_id++;

        const bunch = {
            bananaX: bananaSpawnX,
            bananaY: bananaSpawnY,
            bananaColor,
            id: food_id,
        };

        bunchBananas.push(bunch);
        //console.log("ADDING BUNCH");

        updateQueue.push({
            type: "new_bunch",
            bananaSpawnX,
            bananaSpawnY,
            bananaColor,
            id: food_id,
        });
    }
}

function magnetPull(x, y, banana) {
    updateQueue.push({
        type: "magnet_pull",
        pullLoc: { x, y },
        bananaX: banana.bananaX,
        bananaY: banana.bananaY,
        banana_id: banana.id,
    });
}

function updateTime(elapsedTime) {
    timer += elapsedTime;
    if (timer >= BANANA_SPAWN_TIME) {
        timer -= BANANA_SPAWN_TIME;
        spawnNewBanana();
        spawnNewBunch();
    }

    positionTimer += elapsedTime;
    if (positionTimer >= 1000) {
        positionTimer -= 1000;
        informClientPosition();
    }

    scoreTimer += elapsedTime;
    if (scoreTimer >= 1000) {
        scoreTimer -= 1000;
        sendScoreboard();
    }
}

function sendScoreboard() {
    const scores = [];
    for (const [id, activeClient] of Object.entries(activeClients)) {
        if (!activeClient.player.snake.isAlive()) continue;
        scores.push({
            name: activeClient.player.snake.name,
            score: activeClient.player.snake.score,
        });
    }

    scores.sort((a, b) => b.score - a.score);

    updateQueue.push({
        type: "scoreboard",
        scores,
    });
}

function update(elapsedTime, currentTime) {
    updateTime(elapsedTime);
    for (const [id, activeClient] of Object.entries(activeClients)) {
        if (activeClient.player.snake.isAlive()) {
            // ORDER HERE MATTERS
            if (activeClient.player.snake.needsRotate()) {
                updateQueue.push({
                    type: "turn_point",
                    player_id: id,
                    turnPoint: { ...activeClient.player.snake.center },
                });
                updateQueue.push({
                    type: "head_position",
                    player_id: id,
                    position: { ...activeClient.player.snake.center },
                });
            }
            activeClient.player.snake.addTurnPoint({
                ...activeClient.player.snake.center,
            });
            activeClient.player.snake.update(elapsedTime);
            // ---

            testSnakeWallCollision(activeClient.player.snake, id);
            testSnakeCollision(activeClient.player.snake, id);
            testBananaCollision(activeClient.player.snake, elapsedTime, id);
        }
    }
}

function updateClients(elapsedTime) {
    const tmpUpdateQueue = [...updateQueue];
    updateQueue = [];
    for (const event of tmpUpdateQueue) {
        for (const clientId in activeClients) {
            let client = activeClients[clientId];
            if (event.type === "scoreboard") {
                client.socket.emit("scoreboard", event);
            } else if (event.type === "turn_point") {
                if (clientId == event?.player_id) {
                    client.socket.emit("add_turn", event);
                } else {
                    client.socket.emit("add_other_turn", event);
                }
            } else if (event.type === "input") {
                if (clientId == event?.player_id) {
                    client.socket.emit("add_turn", event);
                } else {
                    client.socket.emit("update_other", event);
                }
            } else if (event.type === "new_single") {
                client.socket.emit("new_single", event);
            } else if (event.type === "magnet_pull") {
                client.socket.emit("magnet_pull", event);
            } else if (event.type === "eat_single") {
                client.socket.emit("eat_single", event);
            } else if (event.type === "new_bunch") {
                client.socket.emit("new_bunch", event);
            } else if (event.type === "head_position") {
                if (clientId != event?.player_id) {
                    client.socket.emit("update_other_head", event);
                } else {
                    client.socket.emit("update_head", event);
                }
            } else if (event.type === "eat_bunch") {
                client.socket.emit("eat_bunch", event);
            } else if (event.type === "snake_kill") {
                if (clientId == event?.snake_id) {
                    client.socket.emit("snake_kill", event);
                } else {
                    client.socket.emit("other_snake_kill", event);
                }
            } else if (event.type === "add_body") {
                if (clientId == event?.player_id) {
                    client.socket.emit("add_body", event);
                } else {
                    client.socket.emit("add_other_body", event);
                }
            }
        }
    }
}

function gameLoop(currentTime, elapsedTime) {
    processInput(elapsedTime);
    update(elapsedTime, currentTime);
    updateClients(elapsedTime);

    let tmp_now = present();
    if (!quit) {
        setTimeout(
            () => {
                let now = present();
                gameLoop(now, now - currentTime);
            },
            UPDATE_RATE_MS - (tmp_now - currentTime),
        );
    }
}

function terminate() {
    quit = true;
}

function start(server) {
    initializeSocketIO(server);
    gameLoop(present(), 0);
}

exports.start = start;
