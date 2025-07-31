const express = require('express');
const app = express();
const path = require('path');
const port = 8080;

const http = require('http');
const socket = require('socket.io');

const server = http.createServer(app);
const io = socket(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    socket.on('send-location', function (data) {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', function () {
        io.emit('user-disconnected', socket.id);
    });

    console.log("New user connected");
})

app.get('/', function (req, res) {
    res.render('index');
})

server.listen(port, function () {
    console.log("Your app running on portttttt " + port);
})

