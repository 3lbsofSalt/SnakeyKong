import { createServer, IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { start } from './game'

const mimeTypes = {
  '.js' : 'text/javascript',
  '.html' : 'text/html',
  '.css' : 'text/css',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.mp3' : 'audio/mpeg3',
  //'.map' : 'application/json',
  '.map' : 'application/octet-stream' // Chrome is requesting socket.io;'s source map file
};

const server = createServer((req, res) => {
  //@ts-ignore
  const lookup = (req.url === '/') ? '/index.html' : decodeURI(req.url);
  const file  = lookup.substring(1, lookup.length);

  fs.access(file, fs.constants.R_OK, function(err) {
    if(!err) {
      fs.readFile(file, function(error, data) {
        if (error) {
          res.writeHead(500);
          res.end('Server Error!');
        } else {
          //@ts-ignore
          let headers = {'Content-type': mimeTypes[path.extname(lookup)]};
          res.writeHead(200, headers);
          res.end(data);
        }
      });

    } else {
      res.writeHead(400);
      res.end();
    }
  });

});

server.listen(3000, function() {
  start(server);
  console.log('Snakey Kong is ready for connections!');
});
