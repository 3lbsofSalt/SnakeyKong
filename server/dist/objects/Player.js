"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createPlayer(socketId) {
    const player = {
        clientId: socketId,
        position: {
            x: Math.random() * 1000,
            y: Math.random() * 1000
        },
        rotation: Math.random() * 360,
        move: () => { }
    };
    player.move = function () {
    };
    return player;
}
exports.default = createPlayer;
