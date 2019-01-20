var express = require('express');
var server = express();

server.use('/', express.static(__dirname + '/'));
server.listen(8080);
console.log('listening to port 8080')