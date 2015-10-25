$(document).ready(function(){
	var socket = io();
	var canvas = document.getElementById("agarCanvas");
	var context = canvas.getContext("2d");
	var mouse = {x:0, y:0};
	var pls;
	var player;

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
		var dx = (mouse.x - player.x);
		var dy = -(mouse.y - player.y);
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

	function getDirection(e){
		var nextDir = direction();
		var newObj = {id: player.id, x: player.x, y: player.y, mass: player.mass, color: player.color, direction: nextDir};
		socket.emit('objUpdate',newObj);
	}

	function drawPlayers(players){
		context.clearRect(0,0,canvas.width,canvas.height);
		for (i = 0; i < players.length ; i++){
			drawCircle(players[i].x, players[i].y, players[i].mass, players[i].color);
		}
	}
	socket.on('ready',function(response){
		pls = response[0];
		player = response[0][response[1]];
		drawPlayers(pls);
		window.addEventListener('mousemove', mousePos);
		// window.addEventListener('mousemove', getDirection);
	});

	socket.on('update',function(response){
		pls = response;
		drawPlayers(pls);
		getDirection();
	});
});