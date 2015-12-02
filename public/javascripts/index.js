$(document).ready(function(){
	var socket = io();
	//var socket = io.connect('http://yaac-jkjones.rhcloud.com:8000');
	var connected = false;
	var canvas = document.getElementById("agarCanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var context = canvas.getContext("2d");
	var img=document.getElementById("smth");
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
	var score=0;

	//saves player's input name
	function getPlayerName(){
		$('button').prop('disabled', false);
		$("#startScreen").show();
		$("#start").on('click',function(){
			var player = {name:$("#pName").val()};
			console.log(player.name);
			socket.emit('playerReady',player);
			$("#startScreen").hide();
			$('#start').prop('disabled', true);
			$("#gameHelper").show();
		});
		$("#pName").keypress(function(e){
	    if (e.which == 13){
	        $("#start").trigger('click');
	    }
		});
	}
	getPlayerName();

	//draws the background grid for the game
	function drawGrid(){
		context.strokeStyle="#d3d3d3";
		context.lineWidth= 0.5;
		//vertical
		for (var i= 0; i<=gameW; i+=50){
			context.beginPath();
			context.moveTo(0, i);
			context.lineTo(gameH, i);
			context.stroke();
			context.closePath();
		}
		///horizontal
		for (var j=0; j<=gameH; j+=50){
			context.beginPath();
			context.moveTo(j, 0);
			context.lineTo(j, gameW);
			context.stroke();
			context.closePath();
		}
	}

	//circle drawing function
	function drawCircle(x, y, radius, color, powerup){
		if (color==="smith"){
			context.save();

		    context.beginPath();
		    context.arc(x, y, radius, 0, 2*Math.PI);
		    context.closePath();
		    context.clip();
		    context.drawImage(img, x-radius, y-radius, radius*2, radius*2);
		    context.restore();
		}
		else{
			context.fillStyle=color;
			context.beginPath();
			context.arc(x, y, radius, 0, 2*Math.PI);
			context.fill();
			context.closePath();
		}

		if (powerup){
			context.lineWidth= 3;
			context.strokeStyle="black";
			context.beginPath();
			context.arc(x, y, radius+5, 0, 2*Math.PI);
			context.closePath();
			context.stroke();
		}
	}

	//draws name at x,y
	function drawName(x, y, name){
		context.font = "bold 30px Arial";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(name,x,y+10);
		context.lineWidth= 0.5;
		context.strokeStyle = "black";
		context.strokeText(name,x,y+10);
	}

	//finds user's mouse positionon "mouseMove" event
	function mousePos(e){
		var rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}

	function isPageHidden(){
		return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
	}

	//finds the distance between the player's blob and the mouse
	//sends that distance's dx and dy components in "dir" to the backend
	//so that it can compute the next position of the blob
	function getDirection(e){
		if (!isPageHidden() && alive){
			//distance between mouse and center of canvas(since that's where blob is drawn)
			dir.dx = mouse.x - canvW/2;
			dir.dy = mouse.y - canvH/2;
			var thisBlob = getBlob(blobId);
			var newObj = {id: thisBlob.id, x: thisBlob.x, y: thisBlob.y, mass: thisBlob.mass, radius: thisBlob.radius, color: thisBlob.color, dir: dir};
			socket.emit('objUpdate',newObj);
		}
	}

	//draw all the players in the given array
	function drawPlayers(players){
		for (i = 0; i < players.length ; i++){
			drawCircle(players[i].x, players[i].y, players[i].radius, players[i].color, players[i].powerup);
			drawName(players[i].x, players[i].y, players[i].name);
		}
	}

	//draw all foods in the given array
	function drawFoods(food){
		for (i = 0; i < food.length ; i++){
				drawCircle(food[i].x, food[i].y, food[i].radius, food[i].color, food[i].powerup);
		}
	}

	//draws the next frame using the various draw methods defined above
	function drawFrame(players, food){
		//if alive, move viewport with the blob
		if (alive){
			var thisBlob = getBlob(blobId);
			context.setTransform(1,0,0,1,0,0); //reset transformations
			context.clearRect(0,0,canvW,canvH); //clear screen
			//find viewport co-ordinates
			viewX = -thisBlob.x + canvW/2
	    	viewY = -thisBlob.y + canvH/2
	    	//translate to new coordinates
	    	context.translate( viewX, viewY );
	    	//draw everything!
	    	drawGrid();
	    	drawFoods(foods);
			drawPlayers(players);
	    }
	    //if dead, keep viewport where blob died
	    //but continue animating so they can watch the game! :)
	    else {
	    	context.setTransform(1,0,0,1,0,0);
	    	context.clearRect(0,0,canvW,canvH);
	    	context.translate( viewX, viewY );
	    	drawGrid();
	    	drawFoods(foods);
			drawPlayers(players);
	    }
	}

	function updateScore(){
		var thisBlob = getBlob(blobId);
		score = thisBlob.score;
		$("#score>span").text(score);
	}

	//connects to server
	//->recieve gameW and gameH
	//->determine initial viewport
	socket.on('init',function(data){
		connected = true;
		foods = data.foods;
		gameW = data.width;
		gameH = data.height;
		//have start screen centered at where blob will be
		viewX = -data.x+ canvW/2;
		viewY = -data.y+ canvH/2;
	});

	//begins game
	//->recieve blobs
	//->recieve your blob
	//->recieve foods
	//->begins drawing
	//->adds mouse event listener
	socket.on('ready',function(response){
		blobs = response.blobs;
		blobId = response.blobId;
		console.log(blobId);
		//foods = response.foods;
		socket.on('death'+blobId,function(){
			//Hide the score bar
			$("#gameHelper").hide();
			$("#score>span").text('');
			//Display the death screen
			$("#deathScreen").show();
			$("#deathScore").text(score);
			console.log("Looks like we died..");
			alive = false;
		});
		alive = true;
		drawFrame(blobs);
		window.addEventListener('mousemove', mousePos);
	});

	//find blob in blobs array
	function getBlob(id){
		for (var i = 0; i < blobs.length; i++){
			if (blobs[i].id == id){
				return blobs[i];
			}
		}
	}

	function updateFoods(foodArr, newFoodObjs, eatenFoodIds){
		if (eatenFoodIds){
			for (var i=foodArr.length-1; i>=0; i--){
				for (var j=0; j<eatenFoodIds.length; j++){
					if (foodArr[i].id==eatenFoodIds[j]) foodArr.splice(i,1);
				}
			}
		}
		for (var k=0; k<newFoodObjs.length; k++){
			foodArr[foodArr.length]=newFoodObjs[k];
		}
		return foodArr;
	}

	//game loop, starts after connection to server
	//->recieves blobs and foods from backend
	//->draws frame
	//->sends direction to backend
	socket.on('update',function(response){
		if (connected){
			blobs = response.blobs;
			//foods = response.foods;
			foods = updateFoods(foods, response.newFoods, response.eatenFoods);
			drawFrame(blobs, foods);
			getDirection();
			if(alive){
				updateScore();
			}
		}
	});
});
