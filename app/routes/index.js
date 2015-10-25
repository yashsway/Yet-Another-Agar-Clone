var express = require('express');
var router = express.Router();

module.exports.getRouter = function(io){

	router.get('/', function(req, res, next) {
		res.render('index.html');
	});

	var blobs = [];
	var blobCount = 0;

	io.on('connection', function(socket){
		var newId = blobs.length;
		blobs[newId] = {id: blobCount++, x: Math.floor((Math.random() * 1200) + 0), y: Math.floor((Math.random() * 600) + 0), mass: 20, color: "green"};
		var response = [blobs, newId];
		socket.emit('ready',response);
		socket.on('objUpdate',function(obj){
			for (var i = 0; i <= blobs.length; i++){
				if (blobs[i].id == obj.id){
					switch(obj.direction){
						case "up":
							blobs[i].y--;
							break;
						case "up-right":
							blobs[i].y--;
							blobs[i].x++;
							break;
						case "up-left":
							blobs[i].y--;
							blobs[i].x--;
							break;
						case "down":
							blobs[i].y++;
							console.log("Changing down");
							break;
						case "down-left":
							blobs[i].y++;
							blobs[i].x--;
							break;
						case "down-right":
							blobs[i].y++;
							blobs[i].x++;
							break;
						case "right":
							blobs[i].x++;
							break;
						case "left":
							blobs[i].x--;
							break;
						default:
							break;
					}
				}
				break;
			}
		});
	});
	//This is our 'game loop' implemented as a callback loop.
	var sendBlobs = function(){
		io.emit('update',blobs);
		setTimeout(sendBlobs,5);
	};
	sendBlobs();

	return router;
};

