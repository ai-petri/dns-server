/**
 * @param {Number} id Message id
 * @param {String} name Domain name
 * @param {String} address IP address 
 */
function createMessage(id, name, address)
{
    var nameParts = name.split(".");
    var questionLength = name.replace(/\./g,"").length + nameParts.length + 5;
    var answerLength = name.replace(/\./g,"").length + nameParts.length + 15;


    var buffer = Buffer.alloc(12 + questionLength + answerLength);

    var offset = 0;

    //ID        2 bytes
    buffer.writeUInt16BE(id,offset);
    offset += 2;

    var str = "";
    //QUERY RESPONSE        1 bit  0 = query, 1 = response 
    str += "1";
    //OPCODE
    str += "0000";
    //AUTHORITATIVE ANSWER
    str += "0";
    //TRUNCATION
    str += "0";
    //RECURSION DESIRED
    str += "1";
    //RECURSION AVAILABLE
    str += "1";
    //RESPONSE CODE
    str += "0000";
    //Z
    str += "000"

    buffer.writeUInt16BE(parseInt(str,2),offset);
    offset += 2;
    
    //QDCOUNT (questions)
    buffer.writeUInt16BE(1,offset);
    offset += 2;

    //ANCOUNT  (answers)
    buffer.writeUInt16BE(1,offset);
    offset += 2;

    //NSCOUNT (name server resource records)
    buffer.writeUInt16BE(0,offset);
    offset += 2;

    //ARCOUNT (additional resource records)
    buffer.writeUInt16BE(0,offset);
    offset += 2;


    // question section

    for(let part of nameParts)
    {
        buffer[offset] = part.length;
        offset++;
        buffer.write(part,offset);
        offset += part.length;
    }
    offset++;

    var qtype = 1;
    buffer.writeUInt16BE(qtype,offset);
    offset += 2;
    var qclass = 1;
    buffer.writeUInt16BE(qclass,offset);
    offset += 2;



    // answer section

    for(let part of nameParts)
    {
        buffer[offset] = part.length;
        offset++;
        buffer.write(part,offset);
        offset += part.length;
    }
    offset++;

    var RRtype = 1;
    buffer.writeUInt16BE(RRtype, offset);
    offset += 2;

    var RRclass = 1;
    buffer.writeUInt16BE(RRclass, offset);
    offset += 2;

    var ttl = 300;
    buffer.writeUInt32BE(ttl, offset);
    offset += 4;

    var rdlength = 4;
    buffer.writeUInt16BE(rdlength, offset);
    offset += 2;


    var rdata = address.split(".").map(Number);
   
    rdata.forEach(byte=>{buffer[offset] = byte; offset++});

    return buffer;
}

module.exports = createMessage;