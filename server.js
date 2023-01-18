const express = require('express');
const socket = require('socket.io');
const app = express();
const http = require('http');
const server  = http.createServer(app);

const io = socket(server);

server.listen(5500, () => {
    console.log('listening on port 5500');
})