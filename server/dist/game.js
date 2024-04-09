"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const present_1 = __importDefault(require("present"));
const socket_io_1 = require("socket.io");
const Player_1 = __importDefault(require("./objects/Player"));
const NetworkAction = {
    CONNECT_ACK: 'connect',
    INPUT: 'input',
    CONNECT_OTHER: 'new_guy',
    DISCONNECT_OTHER: 'dead_guy'
};
const UPDATE_RATE_MS = 30;
let inputQueue = [];
const activeClients = {};
let quit = false;
function initializeSocketIO(server) {
    const io = new socket_io_1.Server(server);
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
    io.on('connection', (socket) => {
        console.log('Connection established: ', socket.id);
        const newPlayer = (0, Player_1.default)(socket.id);
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        socket.emit(NetworkAction.CONNECT_ACK, {
            position: {
                x: newPlayer.position.x,
                y: newPlayer.position.y
            },
            rotation: newPlayer.rotation
        });
        socket.on(NetworkAction.INPUT, data => {
            inputQueue.push({
                clientId: socket.id,
                message: data
            });
        });
        socket.on('disconnect', function () {
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });
        notifyConnect(socket, newPlayer);
    });
}
function processInput(elapsedTime) {
    const processNow = [...inputQueue];
    inputQueue = [];
    while (processNow.length) {
        const input = processNow.shift();
        if (!input)
            continue;
        const client = activeClients[input.clientId];
        client.lastMessageId = input.message.id;
        switch (input.message.type) {
            // Here is where you deal with the input types
        }
    }
}
function update(elapsedTime, currentTime) {
}
function updateClients(elapsedTime) {
}
function gameLoop(currentTime, elapsedTime) {
}
function terminate() {
    quit = true;
}
function start(server) {
    initializeSocketIO(server);
    gameLoop((0, present_1.default)(), 0);
}
exports.start = start;
