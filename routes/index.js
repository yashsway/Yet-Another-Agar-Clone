var express = require('express');
var router = express.Router();

module.exports.getRouter = function(io){

	router.get('/', function(req, res, next) {
		res.render('index.html');
	});

	var blobs = [];
	var blobCount = 0;
	var blobColors = ["red","green","blue","orange","yellow","purple","cyan","magenta"];
	var percent = 0.1;

	io.on('connection', function(socket){
		console.log("Blob " + blobCount + " connected");
		var newId = blobCount++;

		blobs[blobs.length] = {x: Math.floor((Math.random() * 1200) + 0), y: Math.floor((Math.random() * 600) + 0), mass: 20, color: blobColors[newId % blobColors.length], id: newId};
		var response = [blobs, newId];
		socket.emit('ready',response);
		socket.on('disconnect',function(){
			for (var i = 0; i < blobs.length;i++){
				if (blobs[i].id == newId){
					blobs.splice(i,1);
					console.log("Blob " + newId + " disconnected and removed.");
				}
			}
		});
		socket.on('objUpdate',function(obj){
			for (var i = 0; i < blobs.length; i++){
				if (blobs[i].id == obj.id){
					var dx = obj.mouse.x-blobs[i].x;
					var dy = obj.mouse.y-blobs[i].y;
					blobs[i].x = blobs[i].x + dx*percent;
					blobs[i].y = blobs[i].y + dy*percent;
					break;
				}
			}
		});
	});
	//This is our 'game loop' implemented as a callback loop.
	var sendBlobs = function(){
		io.emit('update',blobs);
		setTimeout(sendBlobs,20);
	};
	sendBlobs();

	return router;
};

