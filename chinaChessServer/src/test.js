const net = require('net');
net.connect({
    port: 8888,
    host: "192.168.0.65",
}, (e) => {
    console.log(e)
});
console.log(1);