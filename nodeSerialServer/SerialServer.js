/*
	serialServer.js
	a node.js app to read serial strings and send them to webSocket clients
	requires:
		* node.js (http://nodejs.org/)
		* express.js (http://expressjs.com/)
		* socket.io (http://socket.io/#how-to-use)
		* serialport.js (https://github.com/voodootikigod/node-serialport)
		
	based on the core examples for socket.io and serialport.js
		
	created 21 Aug 2012
	modified 14 Oct 2012
	by Tom Igoe
	
	Patches and improvements suggested by Steve Klise, Lia Martinez, and Will Jennings

*/


var serialport = require("serialport"),				// include the serialport library
	SerialPort  = serialport.SerialPort,			// make a local instance of serial
	app = require('express')();						// start Express framework

app.configure(function(){
  app.use(require('express').bodyParser());
  app.use(require('express').static(__dirname + '/static'));
});
	
var	server = require('http').createServer(app),		// start an HTTP server
  	io = require('socket.io').listen(server);		// filter the server using socket.io

server.listen(8888);								// listen for incoming requests on the server

// console.log("Listening for new clients on port 8080");

// open the serial port.
var myPort = new SerialPort("/dev/ttyAMA0", { 
	baudrate: 38400,
	//buffersize: 2,
	// look for return and newline at the end of each data packet:
	parser: serialport.parsers.readline("\n") 
});


// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

// write command to avr uart
app.post('/sendtoavr', function(req, res) {
	myPort.write(req.body.cmd);
	myPort.drain(function() {});
});

// ################################################
// Routine for uploading new firmware to avr
// ################################################

app.post('/firmware', function(req, res) {
    //console.log(req.body);
	//console.log("Uploaded file: "+ req.files.tmb.path);
	
	var fs = require("fs");
	fs.rename(req.files.tmb.path, "/tmp/flash.hex");
	
    //console.log(JSON.stringify(req.files));

	
	res.sendfile(__dirname + '/index.html');

	io.sockets.emit('serialEvent', {'value':'Closing serial port...'});

	
	myPort.close( function() {  	// Free serial port

	//myPort.on('close', function() {
		io.sockets.emit('serialEvent', {'value':'closed'});
		
		
		var spawn = require('child_process').spawn;
		//var ls = spawn('avrdude', ['avrdude', '-c', 'avr109', '-p', 'm1284p', '-P', '/dev/ttyAMA0', '-b', '38400', '-U', 'flash:w:' + req.files.tmb.path]);
		var ls = spawn('avrdude', ['avrdude', '-c', 'avr109', '-p', 'm1284p', '-P', '/dev/ttyAMA0', '-b', '38400', '-U', 'flash:w:/tmp/flash.hex']);
		
		ls.stdout.on('data', function (data) {
			console.log('stdout: ' + data);
		});

		ls.stderr.on('data', function (data) {
			var debugData = {};
			debugData.value = data.toString().replace(/(\r\n|\n|\r)/gm,"<br //>");
			io.sockets.emit('serialEvent', debugData);
		});

		ls.on('close', function (code) {
			console.log('child process exited with code ' + code);
			io.sockets.emit('serialEvent', {'value':'Opening serial port'});
			myPort.open();
		});	


		
	//});
	});



});


// listen for new socket.io connections:
io.sockets.on('connection', function (socket) {
	// if there's a socket client, listen for new serial data:  
	myPort.on('data', function (data) {
		var serialData = {};

		try {
			serialData = JSON.parse(data);

			if (serialData.t == "d") {	// type = data
				socket.emit('dataEvent', serialData);
			}
			socket.emit('serialEvent', serialData);
		} catch(e) {
			// Invalid data received...
			console.log('Invalid JSON data received: \n');
			console.log(data);
		}
	});
	
	socket.on('sendcmd', function(data) {
		myPort.write(data);
		myPort.drain(function() {});
	});
	
	socket.on('message', function(data) {
		console.log(data);
	});
});

myPort.on('close', function(err) {
	console.log('node-serialport closed!!!');
});

myPort.on('error', function(err) {
	console.log('node-serialport error!!!');
});