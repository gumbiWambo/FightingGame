"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const app = express();
app.use(express.static(path.resolve(__dirname, '../wwwroot')));
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
let waiting = [];
webSocketServer.on('connection', (socket, request) => {
    var _a;
    const route = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/')[1];
    switch (route) {
        case 'search':
            waiting.push(socket);
            if (waiting.length === 2) {
                const first = waiting[0];
                const second = waiting[1];
                if (!!first && !!second) {
                    first.on('message', (data) => {
                        if (JSON.parse(data.toString()).isFirst) {
                            second.send(data);
                        }
                    });
                    second.on('message', (data) => {
                        if (!JSON.parse(data.toString()).isFirst) {
                            first.send(data);
                        }
                    });
                    first.on('close', () => second.close());
                    second.on('close', () => first.close());
                    first.send(JSON.stringify({ type: 'init', value: 'First' }));
                    second.send(JSON.stringify({ type: 'init', value: 'Second' }));
                }
                waiting = [];
            }
            break;
    }
    socket.on('message', (data) => { socket.send(data); });
});
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../wwwroot/index.html'));
});
server.listen(1337, '0.0.0.0', (...args) => {
    console.log(`Server started on port ${JSON.stringify(server.address())}`);
});
//# sourceMappingURL=index.js.map