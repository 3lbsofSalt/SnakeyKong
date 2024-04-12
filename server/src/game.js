import { NetworkAction } from './shared/NetworkActions.js'
import present from 'present';
import { Server as IOServer, Socket } from 'socket.io';

import createPlayer from './objects/Player';
import createFood from './objects/Food';


const food = [];
const eats = [];
const collisions = [];

const UPDATE_RATE_MS = 30;
let inputQueue = [];

const activeClients = {};
let quit = false;

function initializeSocketIO(server) {
  const io = new IOServer(server);

  function notifyConnect(socket, newPlayer) {
    for(let clientId in activeClients) {
      let client = activeClients[clientId];
      if(newPlayer.clientId !== clientId) {
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
    for(const clientId in activeClients) {
      let client = activeClients[clientId];
      if(playerId !== clientId) {
        client.socket.emit(NetworkAction.DISCONNECT_OTHER);
      }
    }
  }

  io.on('connection', (socket) => {
    console.log('Connection established: ', socket.id);


    const newPlayer = createPlayer(socket.id);
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

    socket.on('disconnect', function() {
      delete activeClients[socket.id];
      notifyDisconnect(socket.id);
    })

    notifyConnect(socket, newPlayer);
  });
}

function processInput(elapsedTime) {
  const processNow = [...inputQueue];
  inputQueue = [];

  while(processNow.length) {
    const input = processNow.shift();
    if(!input) continue;
    const client = activeClients[input.clientId];
    client.lastMessageId = input.message.id;
    switch(input.message.type) {
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

function update(elapsedTime, currentTime) {

}

function updateClients(elapsedTime) {

}

function gameLoop(currentTime, elapsedTime) {
}

function terminate() {
  quit = true;
}

export function start(server) {
  initializeSocketIO(server);
  gameLoop(present(), 0);
}

