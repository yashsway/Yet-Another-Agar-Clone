$(document).ready(function(){
	// var socket = io();
	var socket = io.connect('http://yaac-jkjones.rhcloud.com:8000');
	var connected = false;
	var canvas = document.getElementById("agarCanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var context = canvas.getContext("2d");
	var gameW; //width
	var gameH; //height
	var canvW = canvas.width;
	var canvH = canvas.height;
	var mouse = {x:0, y:0};
	var dir = {dx:0,dy:0};
	var foods;
	var blobs;
	var blobId;
	var alive;
	var viewX=0;
	var viewY=0;

	function getPlayerName(){
		$("#startScreen").show();
		$("#start").on('click',function(){
			var player = {name:$("#pName").val()};
			console.log(player.name);
			if(player.name!=''){
				socket.emit('playerReady',player);
				$("#startScreen").hide();
				$("#gameHelper").show();
			}
		});
		$(document).keypress(function(e){
	    if (e.which == 13){
	        $("#start").trigger('click');
	    }
		});
	}
	getPlayerName();

	function drawGrid(){
		context.strokeStyle="#d3d3d3";
		//vertical
		//for (var i=-canvW; i<gameW+canvW; i+=50){
		for (var i= 0; i<=gameW; i+=50){
			context.beginPath();
			context.moveTo(0, i);
			context.lineTo(gameH, i);
			context.stroke();
			context.closePath();
		}
		///horizontal
		//for (var j=-canvH; j<gameH+canvH; j+=50){
		for (var j=0; j<=gameH; j+=50){
			context.beginPath();
			context.moveTo(j, 0);
			context.lineTo(j, gameW);
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

	function drawName(x, y, name){
		context.font = "bold 30px Arial";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(name,x,y+10);
		context.lineWidth= 0.5;
		context.strokeStyle = "black";
		context.strokeText(name,x,y+10);
	}

	function mousePos(e){
		var rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}

	function isPageHidden(){
		return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
	}

	function isInView(obj, xMin, xMax, yMin, yMax){
		var r = obj.radius;
		if (obj.x+r < xMax){
			if (obj.x+r > xMin){
				if (obj.y < yMax){
					if (obj.y > yMin){
						return true;
					}
				}
			}
		}
		return false;
	}

	function getDirection(e){
		if (!isPageHidden() && alive){
			dir.dx = mouse.x - canvW/2;
			dir.dy = mouse.y - canvH/2;
			var thisBlob = getBlob(blobId);
			var newObj = {id: thisBlob.id, x: thisBlob.x, y: thisBlob.y, mass: thisBlob.mass, radius: thisBlob.radius, color: thisBlob.color, dir: dir};
			socket.emit('objUpdate',newObj);
		}
	}

	function drawPlayers(players){
		for (i = 0; i < players.length ; i++){
			//if (isInView(players[i], viewX, viewX+canvW, viewY, viewY+canvW)){
			drawCircle(players[i].x, players[i].y, players[i].radius, players[i].color);
			drawName(players[i].x, players[i].y, players[i].name);//}
		}
	}

	function drawFoods(food){
		for (i = 0; i < food.length ; i++){
			//if (isInView(food[i], viewX, viewX+canvW, viewY, viewY+canvW)){
				drawCircle(food[i].x, food[i].y, food[i].radius, food[i].color);
		}
	}

	function drawFrame(players, food){
		if (alive){
			var thisBlob = getBlob(blobId);
			context.setTransform(1,0,0,1,0,0);
			context.clearRect(0,0,canvW,canvH);
			viewX = -thisBlob.x + canvW/2
	    	viewY = -thisBlob.y + canvH/2
	    	context.translate( viewX, viewY );
	    	drawGrid();
	    	drawFoods(foods);
			drawPlayers(players);
	    }
	    else {
	    	context.setTransform(1,0,0,1,0,0);
	    	context.clearRect(0,0,canvW,canvH);
	    	context.translate( viewX, viewY );
	    	drawGrid();
			drawPlayers(players);
	    }
	}
	socket.on('init',function(data){
		connected = true;
		gameW = data.width;
		gameH = data.height;
	});
	socket.on('ready',function(response){
		blobs = response.blobs;
		blobId = response.blobId;
		console.log(blobId);
		foods = response.foods;
		socket.on('death'+blobId,function(){
			//Hide the score bar
			$("#gameHelper").hide();
			$("#score>span").text('');
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
		if (connected){
			blobs = response.blobs;
			foods = response.foods;
			drawFrame(blobs, foods);
			getDirection();
		}
	});

	function getBlob(id){
		for (var i = 0; i < blobs.length; i++){
			if (blobs[i].id == id){
				return blobs[i];
			}
		}
	}
});
