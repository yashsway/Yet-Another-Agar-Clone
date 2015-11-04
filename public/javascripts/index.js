$(document).ready(function(){
	// var socket = io();
	var socket = io.connect('http://yaac-jkjones.rhcloud.com:8000');
	var canvas = document.getElementById("agarCanvas");
	var context = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;
	var mouse = {x:0, y:0};
	var blobs;
	var blobId;
	var alive;

	function drawGrid(){
		context.strokeStyle="#d3d3d3";
		//vertical
		for (var i=0; i<width; i+=50){
			context.beginPath();
			context.moveTo(0, i);
			context.lineTo(height, i);
			context.stroke();
			context.closePath();
		}
		///horizontal
		for (var j=0; j<height; j+=50){
			context.beginPath();
			context.moveTo(j, 0);
			context.lineTo(j, width);
			context.stroke();
			context.closePath();
		}
	}

	function drawCircle(x, y, radius, color){
		context.fillStyle=color;
		context.beginPath();
		context.arc(x, y, radius, 0, 2*Math.PI);
		context.fill();
		context.closePath();
	}

	function mousePos(e){
		var rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}

	function isPageHidden(){
		return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
	}

	function getDirection(e){
		if (!isPageHidden() && alive){
			var newObj = {id: getBlob(blobId).id, x: getBlob(blobId).x, y: getBlob(blobId).y, mass: getBlob(blobId).mass, color: getBlob(blobId).color, mouse: mouse};
			socket.emit('objUpdate',newObj);
		}
	}

	function drawPlayers(players){
		for (i = 0; i < players.length ; i++){
			drawCircle(players[i].x, players[i].y, players[i].mass, players[i].color);
		}
	}

	function drawFrame(players){
		context.clearRect(0,0,canvas.width,canvas.height);
		drawGrid();
		drawPlayers(players);
	}

	socket.on('ready',function(response){
		blobs = response[0];
		blobId = response[1];
		socket.on('death'+blobId,function(){
			console.log("Looks like we died..");
			alive = false;
		});
		alive = true;
		drawFrame(blobs);
		window.addEventListener('mousemove', mousePos);
	});

	socket.on('update',function(response){
		blobs = response;
		drawFrame(blobs);
		getDirection();
	});
	function getBlob(id){
		for (var i = 0; i < blobs.length; i++){
			if (blobs[i].id == id){
				return blobs[i];
			}
		}
	}
});