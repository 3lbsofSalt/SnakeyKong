import Player from "../types/objects/Player";

export default function createPlayer(socketId: string) {
  const player: Player = {
    clientId: socketId,
    position: {
      x: Math.random() * 1000,
      y: Math.random() * 1000
    },
    rotation: Math.random() * 360,
    move: () => {}
  };

  player.move = function() {

  }

  return player;
}
