const dgram = require("dgram");
const createMessage = require("./createMessage");
const decodeMessage = require("./decodeMessage");

var socket = dgram.createSocket("udp4");

socket.on("message", (data, info)=>
{
    let message = decodeMessage(data);
    let answer = createMessage(message.id, message.questions[0].qname, "127.0.0.1");
    socket.send(answer, info.port, info.address);
});



socket.bind(53);




