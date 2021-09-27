const dgram = require("dgram");
const createMessage = require("./createMessage");
const decodeMessage = require("./decodeMessage");

var socket = dgram.createSocket("udp4");
var socket2 = dgram.createSocket("udp4");

var records = new Map([
    ["localhost","127.0.0.1"]
]);

var clients = new Map();

socket.on("message", (data, info)=>
{
    let message = decodeMessage(data);

    let name = message.questions[0].qname;

    if(records.has(name))
    {
        let answer = createMessage(message.id, name, records.get(name));
        socket.send(answer, info.port, info.address);
    }
    else
    {
        clients.set(message.id, {address:info.address, port:info.port});
        socket2.send(data, 53, "8.8.8.8");
    }
    
});

socket2.on("message", (data,info)=>
{
    let message = decodeMessage(data);
    if(clients.has(message.id))
    {
        let client = clients.get(message.id);
        socket.send(data, client.port, client.address);
        clients.delete(message.id);
    }
});


socket.bind(53);
socket2.bind(8080);





