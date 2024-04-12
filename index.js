const { createServer } = require("http");
const fs = require("fs");
const path = require("path");
const { start } = require("./server/src/game.js");

const mimeTypes = {
    ".js": "text/javascript",
    ".html": "text/html",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".mp3": "audio/mpeg3",
    ".svg": "image/svg+xml",
    ".map": "application/json",
    ".map": "application/octet-stream", // Chrome is requesting socket.io;'s source map file
};

const server = createServer((req, res) => {
    //@ts-ignore
    const lookup = req.url === "/" ? "/index.html" : decodeURI(req.url);
    const file = lookup.substring(1, lookup.length);

    fs.access(file, fs.constants.R_OK, function (err) {
        if (!err) {
            fs.readFile(file, function (error, data) {
                if (error) {
                    res.writeHead(500);
                    res.end("Server Error!");
                } else {
                    let headers = {
                        "Content-type": mimeTypes[path.extname(lookup)],
                    };
                    res.writeHead(200, headers);
                    res.end(data);
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
});

server.listen(3000, function () {
    start(server);
    console.log("Snakey Kong is ready for connections at port 3000!");
});
