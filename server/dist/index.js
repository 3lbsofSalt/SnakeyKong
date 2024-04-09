"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const game_1 = require("./game");
const mimeTypes = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg3',
    //'.map' : 'application/json',
    '.map': 'application/octet-stream' // Chrome is requesting socket.io;'s source map file
};
const server = (0, http_1.createServer)((req, res) => {
    //@ts-ignore
    const lookup = (req.url === '/') ? '/index.html' : decodeURI(req.url);
    const file = lookup.substring(1, lookup.length);
    fs_1.default.access(file, fs_1.default.constants.R_OK, function (err) {
        if (!err) {
            fs_1.default.readFile(file, function (error, data) {
                if (error) {
                    res.writeHead(500);
                    res.end('Server Error!');
                }
                else {
                    //@ts-ignore
                    let headers = { 'Content-type': mimeTypes[path_1.default.extname(lookup)] };
                    res.writeHead(200, headers);
                    res.end(data);
                }
            });
        }
        else {
            res.writeHead(400);
            res.end();
        }
    });
});
server.listen(3000, function () {
    (0, game_1.start)(server);
    console.log('Snakey Kong is ready for connections!');
});
