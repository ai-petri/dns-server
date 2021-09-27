
/**
 * @param {Buffer} buffer 
 */
function decodeMessage(buffer)
{
    if(buffer.length < 12) return;

    // header section
    var offset = 0;

    var id = buffer.readUInt16BE(offset);

    offset += 2;

    var str = buffer.readUInt16BE(offset).toString(2).padStart(16, "0");

    var qr = +str[0]
    var opcode = str.slice(1,5);
    var authoritativeAnswer = +str[5];
    var truncation = +str[6];
    var recursionDesired = +str[7];  
    var recursionAvailable = +str[8]; 
    var responseCode = str.slice(9,13);
    
    offset += 2;

    var qdcount = buffer.readUInt16BE(offset);

    offset += 2;

    var ancount = buffer.readUInt16BE(offset);

    offset += 2;

    var nscount = buffer.readUInt16BE(offset);

    offset += 2;

    var arcount = buffer.readUInt16BE(offset);

    offset += 2;


    // question section

    
    var questions = [];

    for(let i=0; i<qdcount; i++)
    {
        if(offset == buffer.length) break;

        let qname = "";

        let length = buffer[offset];

        while(length > 0 && offset < buffer.length) 
        {
            offset++;    
            qname += (qname? "." : "") + buffer.slice(offset, offset+length);
            offset += length;
            length = buffer[offset];
        }
        offset++; 
        let qtype = buffer.readUInt16BE(offset);
        offset += 2;

        let qclass = buffer.readUInt16BE(offset);
        offset += 2;

        questions.push({qname,qtype,qclass});
    }

    
    
    // answer section
    var answers = [];
    for(let i=0; i<ancount; i++)
    {
        if(offset == buffer.length) break;

        let name = "";

        while(buffer[offset] > 0 && buffer[offset] >> 6 !== 3 && offset < buffer.length) 
        {
            let length = buffer[offset];
            offset++;    
            name += (name? "." : "") + buffer.slice(offset, offset+length);
            offset += length;      
        }

        if(buffer[offset] == 0)
        {
            offset++;
        }

        if(buffer[offset] >> 6 == 3)
        {
            let pointer = buffer.readUInt16BE(offset) & 0b00111111_11111111;       
            let length = buffer[pointer];
            while(length > 0 && pointer < buffer.length)
            {
                pointer++;
                name += (name? "." : "") + buffer.slice(pointer, pointer+length);
                pointer += length;
                length = buffer[pointer];
            }
            offset += 2;
        }
        
        let RRtype = buffer.readUInt16BE(offset);

        offset += 2;

        let RRclass = buffer.readUInt16BE(offset);

        offset += 2;

        let ttl = buffer.readUInt32BE(offset);

        offset += 4;

        let rdlength = buffer.readUInt16BE(offset);

        offset += 2;

        let rdata = buffer.slice(offset, offset + rdlength);

        answers.push({name,RRtype,RRclass, ttl, rdlength, rdata});
    }

    return {
        id, qr, opcode, authoritativeAnswer, truncation, recursionDesired, recursionAvailable, responseCode,
        qdcount, ancount, nscount, arcount, questions, answers
    }
    
}


module.exports = decodeMessage;