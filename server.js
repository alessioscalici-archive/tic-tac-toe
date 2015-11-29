var express = require('express');
var app = express();

app.use(express.static(__dirname + '/build'));

app.use('/report', express.static(__dirname + '/report'));
app.use('/docs', express.static(__dirname + '/docs'));


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Angular app listening at http://%s:%s', host, port);
});