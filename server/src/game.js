const NetworkAction = require("./shared/NetworkActions.js");
const present = require("present");

const { createPlayer } = require("./objects/Player.js");
const createFood = require("./objects/Food.js");

const food = [];
const eats = [];
const collisions = [];

const segmentDistance = 30;
const rotateRate = Math.PI / 1000; // Radians per second
const moveRate = 200 / 1000; // Pixels per second
const UPDATE_RATE_MS = 30;
let inputQueue = [];

const activeClients = {};
let quit = false;

function initializeSocketIO(server) {
    const io = require("socket.io")(server);

    function notifyConnect(socket, newPlayer) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                client.socket.emit(NetworkAction.CONNECT_OTHER, {
                    // new player's initial starting data
                });

                socket.emit(NetworkAction.CONNECT_OTHER, {
                    // tell the new player about this already connected player
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

        socket.server.engine.on("connection_error", (err) => {
            console.log(err.code); // the error code, for example 1
            console.log(err.message); // the error message, for example "Session ID unknown"
            console.log(err.context); // some additional error context
        });

        const newPlayer = createPlayer(socket.id);
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer,
        };

        console.log("frik");
        //socket.emit(NetworkAction.CONNECT_ACK, {});
        socket.emit("connect-ack", {});
        /*
    socket.on(NetworkAction.CLIENT_JOIN_REQUEST, function() {
      socket.emit(NetworkAction.CLIENT_JOIN, {
        position: {
          x: newPlayer.position.x,
          y: newPlayer.position.y
        },
        rotation: newPlayer.rotation,
        moveRate,
        rotateRate,
        segmentDistance,
        startingSegments: 3
      });
    });

    socket.on(NetworkAction.INPUT, data => {
      inputQueue.push({
        clientId: socket.id,
        message: data
      });
    });

    socket.on('disconnect', function() {
      console.log('disconnect?')
      delete activeClients[socket.id];
      notifyDisconnect(socket.id);
    })
    */

        //notifyConnect(socket, newPlayer);
    });
}

function processInput(elapsedTime) {
    const processNow = [...inputQueue];
    inputQueue = [];

    while (processNow.length) {
        const input = processNow.shift();
        if (!input) continue;
        const client = activeClients[input.clientId];
        client.lastMessageId = input.message.id;
        switch (input.message.type) {
            case NetworkAction.INPUT_DOWN:
                client.player.move();
                break;
            case NetworkAction.INPUT_UP:
                client.player.move();
                break;
            case NetworkAction.INPUT_LEFT:
                client.player.move();
                break;
            case NetworkAction.INPUT_RIGHT:
                client.player.move();
                break;
        }
    }
}

function update(elapsedTime, currentTime) {}

function updateClients(elapsedTime) {}

function gameLoop(currentTime, elapsedTime) {}

function terminate() {
    quit = true;
}

function start(server) {
    initializeSocketIO(server);
    gameLoop(present(), 0);
}

exports.start = start;
