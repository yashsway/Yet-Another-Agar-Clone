$(document).ready(function(){
	var socket = io();
	//var socket = io.connect('http://yaac-jkjones.rhcloud.com:8000');
	var canvas = document.getElementById("agarCanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var context = canvas.getContext("2d");
	var gameW = 3000; //width
	var gameH = 3000; //height
	var canvW = canvas.width;
	var canvH = canvas.height;
	var mouse = {x:0, y:0};
	var dir = {dx:0,dy:0};
	var blobs;
	var blobId;
	var alive;
	var viewX=0;
	var viewY=0;

	function drawGrid(){
		context.strokeStyle="#d3d3d3";
		//vertical
		for (var i=-canvW; i<gameW+canvW; i+=50){
			context.beginPath();
			context.moveTo(-canvH, i);
			context.lineTo(gameH+canvH, i);
			context.stroke();
			context.closePath();
		}
		///horizontal
		for (var j=-canvH; j<gameH+canvH; j+=50){
			context.beginPath();
			context.moveTo(j, -canvW);
			context.lineTo(j, gameW+canvW);
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
			dir.dx = mouse.x - canvW/2;
			dir.dy = mouse.y - canvH/2;
			var thisBlob = getBlob(blobId);
			var newObj = {id: thisBlob.id, x: thisBlob.x, y: thisBlob.y, mass: thisBlob.mass, color: thisBlob.color, dir: dir, speed: 10};
			socket.emit('objUpdate',newObj);
		}
	}

	function drawPlayers(players){
		for (i = 0; i < players.length ; i++){
			drawCircle(players[i].x, players[i].y, players[i].mass, players[i].color);
		}
	}

	function drawFrame(players){
		if (alive){
			var thisBlob = getBlob(blobId);
			context.setTransform(1,0,0,1,0,0);
			context.clearRect(0,0,canvW,canvH);
			viewX = -thisBlob.x + canvW/2
	    	viewY = -thisBlob.y + canvH/2
	    	context.translate( viewX, viewY );
	    	drawGrid();
			drawPlayers(players);
	    }
	    else {
	    	context.clearRect(0,0,canvW,canvH);
	    	drawGrid();
			drawPlayers(players);
	    }
	}

	socket.on('ready',function(response){
		blobs = response[0];
		blobId = response[1];
		socket.on('death'+blobId,function(){
			//Display the death screen
			$("#deathScreen").show();
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
