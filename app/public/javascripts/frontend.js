var canvas = document.getElementById("agarCanvas");
var context = canvas.getContext("2d");
var mouse= {x:0, y:0};
var pls = [{x: 300,y:340, mass: 50, color:"green"}]

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

function direction(player){
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
			else return "down-left"
		}
	}
	else{
		if (dy>0) return "up";
		else return "down";
	}

}

function getDirection(e){
	console.log(direction(pls[0]));
}

window.addEventListener('mousemove', mousePos);
window.addEventListener('mousemove', getDirection);

function drawPlayers(players){
	for (i = 0; i < players.length ; i++){
		drawCircle(players[i].x, players[i].y, players[i].mass, players[i].color);
	}
}

drawPlayers(pls);