const starting_directions = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2];

function createPlayer(socketId) {
    const player = {
        clientId: socketId,
        position: {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
        },
        rotation: starting_directions[Math.floor(Math.random() * 4)],
        move: () => {},
    };

    player.move = function () {};

    return player;
}

exports.createPlayer = createPlayer;
