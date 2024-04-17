const NetworkAction = require("./shared/NetworkActions.js");
const present = require("present");

const { createPlayer } = require("./objects/Player.js");
const createFood = require("./objects/Food.js");

const food = [];
const eats = [];
const collisions = [];

const WORLD_WIDTH = 4800;
const WORLD_HEIGHT = 2600;

const segmentDistance = 30;
const rotateRate = Math.PI / 1000; // Radians per second
const moveRate = 200 / 1000; // Pixels per second
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
                client.socket.emit(NetworkAction.DISCONNECT_OTHER);
            }
        }
    }

    io.on("connection", function (socket) {
        console.log("Connection established: ", socket.id);

        socket.emit("connect-ack", {});

        socket.on("join-request", function () {
            const newPlayer = createPlayer(
                socket.id,
                moveRate,
                rotateRate,
                segmentDistance,
            );
            activeClients[socket.id] = {
                socket: socket,
                player: newPlayer,
            };

            socket.emit("join", {
                position: {
                    x: newPlayer.snake.head.center.x,
                    y: newPlayer.snake.head.center.y,
                },
                rotation: newPlayer.snake.direction,
                moveRate,
                rotateRate,
                segmentDistance,
                startingSegments: 3,
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
            desired: client.player.snake.head.desiredRotation,
            turnPoint: { ...client.player.snake.head.center },
        });
    }
}

function update(elapsedTime, currentTime) {
    for (const [id, activeClient] of Object.entries(activeClients)) {
        activeClient.player.snake.update(elapsedTime);
    }
}

function updateClients(elapsedTime) {
    const tmpUpdateQueue = [...updateQueue];
    updateQueue = [];
    for (const event of tmpUpdateQueue) {
        for (const clientId in activeClients) {
            let client = activeClients[clientId];
            if (clientId == event.player_id) continue;
            if (event.type === "input") {
                client.socket.emit("update_other", event);
            }
        }
    }
}

function gameLoop(currentTime, elapsedTime) {
    processInput(elapsedTime);
    update(elapsedTime, currentTime);
    updateClients(elapsedTime);

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, UPDATE_RATE_MS - elapsedTime);
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
