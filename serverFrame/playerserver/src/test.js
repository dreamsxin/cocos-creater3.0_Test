const net = require('net');
net.connect({
    port: 8888,
    host: "192.168.0.65",
}, (e) => {
    console.log(e)
});
console.log(1);

/*
    ---------------------------nodejs作为客户端直接链接服务器---------------------------

    var WebSocketClient = require('websocket').client;
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        console.log('WebSocket Client Connected');
        connection.send("what`s your name?");
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function (message) {
        });

        function sendNumber() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
                setTimeout(sendNumber, 1000);
            }
        }
        sendNumber();
    });

    client.connect('ws://0.0.0.0:9000/');
*/