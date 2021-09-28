const dgram = require("dgram");
const http = require("http");
const path = require("path");
const fs = require("fs");
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



const server = http.createServer((req,res)=>
{
    let data = "";
    let response;
    req.on("data", chunk=>data+=chunk);

    req.on("end", _=>{
        if(req.url == "/")
        {
            let stream = fs.createReadStream(path.join(__dirname,"public","index.html"));
            stream.pipe(res);
            return;
        }


        if(!req.url.startsWith("/api/"))
        {
            let parts = req.url.split("?")[0].substring(1).split("/");
            if(parts.filter(part=> !/^[^\/\\?%*:|"<>]*$/.test(part)).length > 0)
            {
                res.writeHead(400, "Bad Request");
                res.end("<h1>400 Bad Request</h1>");
                return;
            }

            let file = path.join(__dirname, "public", ...parts);
            if(fs.existsSync(file))
            {
                let stream = fs.createReadStream(file);
                stream.pipe(res);
            }
            else
            {
                res.writeHead(404, "Not Found");
                res.end("<h1>404 Not Found</h1>");
            }
             
            return;        
        }


        switch(req.url)
        {
            case "/api/records":
                response = Object.fromEntries(records);
                break;
            case "/api/records/add":
                if(/\{(\"[a-z0-9.]+\"\:\"[a-z0-9.]+\")(,(\r?\n)*\"[a-z0-9]+\"\:\"[a-z0-9.]+\")*\}/i.test(data))
                {
                    let entries = Object.entries(JSON.parse(data));
                    let updated = 0;                   
                    entries.forEach(([key,value])=>{
                        if(records.get(key))
                        {
                            updated ++;
                        }
                        records.set(key,value);
                    });
                   
                    response =
                    {
                        success:true,
                        recieved:entries.length,
                        updated,
                        added:entries.length - updated
                    }   
                }
                else
                {
                    response =
                    {
                        success:false
                    }
                }
                break;

            case "/api/records/delete":
                if(/\[\"[a-z0-9.]+\"(,\"[a-z0-9.]+\")*\]/.test(data))
                {
                    let names = JSON.parse(data);
                    let deleted = 0;
                    names.forEach(name => deleted += records.delete(name));
                    response =
                    {
                        success:true,
                        recieved:names.length,
                        deleted
                    }
                }
                else
                {
                    response =
                    {
                        success:false
                    }
                }

        }


        if(response)
        {
            res.writeHead(200, "OK",
            {
                "Access-Control-Allow-Origin":"*",
                "Content-Type":"application/json"
            });
            res.end(JSON.stringify(response));
        }
        else
        {
            res.writeHead(404, "Not Found");
            res.end();
        }

    });
});

server.listen(80);





