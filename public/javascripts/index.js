$(document).ready(function(){
	//var socket = io();
	var socket = io.connect('http://yaac-jkjones.rhcloud.com:8000');
	var canvas = document.getElementById("agarCanvas");
	var context = canvas.getContext("2d");
	var mouse = {x:0, y:0};
	var blobs;
	var blobId;

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

	function direction(){
		var dx = (mouse.x - getBlob(blobId).x);
		var dy = -(mouse.y - getBlob(blobId).y);
		var slope = dy/dx;
		if (Math.abs(slope) < 0.5){
			if (dx > 0) return "right";
			else return "left";
		}
		else if (Math.abs(slope) < 2){
			if (dy>0){
				if (dx>0) return "up-right";
				else return "up-left";
			}
			else {
				if (dx>0) return "down-right";
				else return "down-left";
			}
		}
		else{
			if (dy>0) return "up";
			else return "down";
		}

	}

	function isPageHidden(){
		return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
	}

	function getDirection(e){
		if (!isPageHidden()){
			var nextDir = direction();
			var newObj = {id: getBlob(blobId).id, x: getBlob(blobId).x, y: getBlob(blobId).y, mass: getBlob(blobId).mass, color: getBlob(blobId).color, direction: nextDir};
			socket.emit('objUpdate',newObj);
		}
	}

	function drawPlayers(players){
		context.clearRect(0,0,canvas.width,canvas.height);
		for (i = 0; i < players.length ; i++){
			drawCircle(players[i].x, players[i].y, players[i].mass, players[i].color);
		}
	}
	socket.on('ready',function(response){
		blobs = response[0];
		blobId = response[1];
		drawPlayers(blobs);
		window.addEventListener('mousemove', mousePos);
	});

	socket.on('update',function(response){
		blobs = response;
		drawPlayers(blobs);
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