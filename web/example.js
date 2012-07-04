var SerialPort  = require("serialport").SerialPort;
var portName = "/dev/tty.usbmodemfa1331";
var fs = require("fs");
var url = require("url");

// static file http server
// serve files for application directory

var root = "web";
var http = require("http").createServer(handle);

function handle (req, res) {
	var request = url.parse(req.url, false);
	console.log("Serving request: " + request.pathname);

	var filename = request.pathname;
	
	if(filename == "/") { filename = "/index.html"; }
	
	filename = root + filename;

	try {
		fs.realpathSync(filename);
	} catch (e) {
		res.writeHead(404);
		res.end();
	}

	var contentType = "text/plain";

	if (filename.match(".js$")) {
		contentType = "text/javascript";
	} else if (filename.match(".html$")) {
		contentType = "text/html";
	}

	fs.readFile(filename, function(err, data) {
		if (err) {
			res.writeHead(500);
			res.end();
			return;
		}

		res.writeHead(200, {"Content-Type": contentType});
		res.write(data);
		res.end();
	});	
}

http.listen(9090);

console.log("server started on localhost:9090");

var io = require("socket.io").listen(http); // server listens for socket.io communication at port 8000
io.set("log level", 1); // disables debugging. this is optional. you may remove it if desired.

var sp = new SerialPort(portName, {
	baudrate: 9600
}); // instantiate the serial port.

sp.on("close", function (err) {
  console.log("port closed");
});

sp.on("error", function (err) {
  console.error("error", err);
});

sp.on("open", function () {
  console.log("Arduino connected.");
});

io.sockets.on("connection", function (socket) {
    // If socket.io receives message from the client browser then 
    // this call back will be executed.

	console.log("Websocket opened");
	sp.write("{c}");
	socket.emit("message", "ok");
	
    socket.on("message", function (data) {
		var msg = data["value"];
		if(msg != "") {
			console.log("On message: " + msg);
			sp.write(msg);
		}
		socket.emit("message", "ok");
    });
    // If a web browser disconnects from Socket.IO then this callback is called.
    socket.on("disconnect", function () {
        console.log("disconnected");
    });
});

sp.on("data", function (data) { // call back when data is received

	console.log(data.toString());
});