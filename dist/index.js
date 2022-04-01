"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
app.get('/', () => {
    console.log('EEEE');
});
server.listen(1337, '172.0.0.1', (...args) => {
    console.log(args);
    console.log(`Server started on port ${JSON.stringify(server.address())}`);
});
//# sourceMappingURL=index.js.map