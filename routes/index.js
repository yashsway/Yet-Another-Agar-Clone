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

		blobs[blobs.length] = {x: Math.floor((Math.random() * 3000) + 0), y: Math.floor((Math.random() * 3000) + 0), mass: Math.floor((Math.random() * 20) + 5), color: blobColors[newId % blobColors.length], id: newId};
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
					var dx = obj.dir.dx
					var dy = obj.dir.dy
					if (0 <= blobs[i].x + dx*percent && 3000 >= blobs[i].x + dx*percent){
						blobs[i].x = blobs[i].x + dx*percent;
					}
					if (0 <= blobs[i].y + dy*percent && 3000 >= blobs[i].y + dy*percent){
						blobs[i].y = blobs[i].y + dy*percent;
					}
					break;


				}
			}
		});
	});
	// O(n^2) should probably improve
	var checkEating = function(){
		for (var i = 0; i < blobs.length; i++) {
			for (var j = 0; j < blobs.length; j++) {
				console.log(blobs[i].id + " will eat " + blobs[j].id + ": " + (i != j && !blobs[i].eaten && !blobs[j].eaten && inside(blobs[j],blobs[i])));
				// Checking for the eating of blobs that haven't already been eaten.
				if (i != j && !blobs[i].eaten && !blobs[j].eaten && inside(blobs[j],blobs[i])){
					console.log("Doing eating of " + blobs[j].id  + " by " + blobs[i].id);
					blobs[i].mass += blobs[j].mass;
					blobs[j].eaten = true; //Mark blob for deletion
				}
			}
		}
		// Remove eaten blobs (we loop in reverse to avoid the trouble of index changes)
		for (var k = blobs.length - 1; k >= 0; k--) {
			if (blobs[k].eaten){
				console.log("Killing blob: " + blobs[k].id);
				io.emit('death'+blobs[k].id,blobs[k]);
				blobs.splice(k,1);
			}
		}
	};
	//checks if blob a is inside blob b
	var inside = function(a,b){
		var distance = Math.sqrt(Math.pow((b.x - a.x),2) + Math.pow((b.y - a.y),2));
		console.log("Distance: " + distance);
		console.log("Difference: " + (b.mass - a.mass));
		console.log("Inside: " + (distance < b.mass - a.mass));
		if (distance < b.mass - a.mass){
			return true;
		}
		return false;
	};
	//This is our 'game loop' implemented as a callback loop.
	var sendBlobs = function(){
		checkEating();
		io.emit('update',blobs);
		setTimeout(sendBlobs,20);
	};
	sendBlobs();

	return router;
};
