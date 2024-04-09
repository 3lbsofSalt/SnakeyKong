import { type Server } from 'http';
import { type IOInputEvent } from './types/game';
import type Player from './types/objects/Player';

//@ts-ignore
import present from 'present';
import { Server as IOServer, Socket } from 'socket.io';
import createPlayer from './objects/Player';

const NetworkAction: Record<string, string> = {
  CONNECT_ACK: 'connect',
  INPUT: 'input',
  CONNECT_OTHER: 'new_guy',
  DISCONNECT_OTHER: 'dead_guy'
};

const UPDATE_RATE_MS = 30;
let inputQueue: IOInputEvent[] = [];

type ActiveClients = Record<string, {
  socket: Socket,
  player: Player,
  lastMessageId?: string
}>;

const activeClients: ActiveClients = {};
let quit = false;

function initializeSocketIO(server: Server) {
  const io = new IOServer(server);

  function notifyConnect(socket: Socket, newPlayer: Player) {
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

  function notifyDisconnect(playerId: string) {
    for(const clientId in activeClients) {
      let client = activeClients[clientId];
      if(playerId !== clientId) {
        client.socket.emit(NetworkAction.DISCONNECT_OTHER);
      }
    }
  }

  io.on('connection', (socket: Socket) => {
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

function processInput(elapsedTime: number) {
  const processNow = [...inputQueue];
  inputQueue = [];

  while(processNow.length) {
    const input = processNow.shift();
    if(!input) continue;
    const client = activeClients[input.clientId];
    client.lastMessageId = input.message.id;
    switch(input.message.type) {
      // Here is where you deal with the input types
    }
  }
}

function update(elapsedTime: number, currentTime: number) {

}

function updateClients(elapsedTime: number) {

}

function gameLoop(currentTime: number, elapsedTime: number) {
}

function terminate() {
  quit = true;
}

export function start(server: Server) {
  initializeSocketIO(server);
  gameLoop(present(), 0);
}

