$(document).ready(function(){
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

    var cw = 10;
    var d;

    var left_track = [];
    var right_track = [];
    var leftRed = {};
    var rightRed = {};

    var carPos = { x: 225, y: 425 };

	var paint_cell = function(x, y, insideColor) {
		if (!insideColor) {
			insideColor = "green";
		}
		context.fillStyle = insideColor;
		context.fillRect(x, y, cw, cw);
		context.strokeStyle = "black";
		context.strokeRect(x, y, cw, cw);
	}

	var paint_track = function() {
		for(var i = 0; i < left_track.length; i++) {
			var left = left_track[i];
			var right = right_track[i];
			var insideColor = "green";

			var leftTop = left.y;
			var leftBottom = left.y + cw;
			if (leftTop >= carPos.top && leftTop < carPos.bottom) {
				insideColor = "red";
				leftRed.x = left.x;
				leftRed.y = left.y;
				rightRed.x = right.x;
				rightRed.y = right.y;
			}
			paint_cell(left.x, left.y, insideColor);
			paint_cell(right.x, right.y, insideColor);
		}
	}

	var get_next_direction = function () {
		var nextDirection = Math.round(Math.random() * 3);
		var dx = 0;
		if (nextDirection === 1 && ticksSinceLastUpdate > ticksBetweenMoves) {
			dx = -1;
			ticksSinceLastUpdate = 0;
		} else if (nextDirection === 2 && ticksSinceLastUpdate > ticksBetweenMoves) {
			dx = 1;
			ticksSinceLastUpdate = 0;
		}
		else {
			ticksSinceLastUpdate++;
		}
		return dx;
	}

	var ticksSinceLastUpdate = 0;
	var ticksBetweenMoves = 1;
	var update_track = function() {
		var oldLeftEnd = left_track[left_track.length-1];
		var oldRightEnd = right_track[right_track.length-1];
		
		var dx = get_next_direction();
		//dx = 0;
		var newLeftEnd = { x: oldLeftEnd.x + (dx * cw / 2), y: oldLeftEnd.y };
		dx = get_next_direction();
		var newRightEnd = { x: oldRightEnd.x + (dx * cw / 2), y: oldRightEnd.y };

		if (newLeftEnd.x < 0) {
			newLeftEnd.x = 0;
		} else if (newLeftEnd.x > 0.4 * w) {
			newLeftEnd.x = 0.4 * w;
		}

		if (newRightEnd.x > w) {
			newRightEnd.x = w;
		} else if (newRightEnd.x < 0.6 * w) { 
			newRightEnd.x = 0.6 * w;
		}

		for(var i=0; i < left_track.length; i++) {
			left_track[i].y+=cw;
			right_track[i].y+=cw;
		}

		left_track.push(newLeftEnd);
		left_track.shift();
		right_track.push(newRightEnd);
		right_track.shift();
	}

	var paint_car = function() {
		var carWidth = 10;
		var carHeight = 10;
		var toMoveX = carWidth / 2;
		var toMoveY = carHeight / 2;

		var lowerLeftPoint = { x: carPos.x - toMoveX, y: carPos.y + toMoveY };
		var frontOfCar = { x: carPos.x, y: carPos.y - toMoveY };
		var lowerRightPoint = { x: carPos.x + toMoveX, y: carPos.y + toMoveY };
		
		carPos.left = lowerLeftPoint.x;
		carPos.right = lowerRightPoint.x;
		carPos.top = frontOfCar.y;
		carPos.bottom = lowerLeftPoint.y; 

		context.beginPath();
		context.moveTo(lowerLeftPoint);
		context.lineTo(lowerLeftPoint.x, carPos.y - (toMoveY / 2));
		context.lineTo(carPos.x - (toMoveX / 2), frontOfCar.y);

		context.lineTo(carPos.x + (toMoveX / 2), frontOfCar.y);
		context.lineTo(lowerRightPoint.x, carPos.y - (toMoveY / 2));
		context.lineTo(lowerRightPoint.x, lowerRightPoint.y);
		context.lineTo(lowerLeftPoint.x, lowerLeftPoint.y);

		context.fill();
		context.stroke();
		context.closePath();
	}

	var paint = function() {
		context.fillStyle = "black";
		context.fillRect(0, 0, w, h);
		context.strokeStyle = "black";
		context.strokeRect(0, 0, w, h);

		update_track();

		paint_track();

		paint_car();

		context.font = "bold 10px sans-serif";
		context.fillText("pos.x: " + carPos.x, 5, h - 15);
		context.fillText("pos.y: " + carPos.y, 5, h - 5);
		if (leftRed.x && leftRed.y) {
			context.fillStyle = "red";
		    context.fillText("leftRed: " + leftRed.x + ", " + leftRed.y, 5, h - 35);
		}
		if (rightRed.x && rightRed.y) {
			context.fillStyle = "red";
			context.fillText("rightRed: " + rightRed.x + ", " + rightRed.y, 5, h - 25);
		}
		
	}

	var keyPressDx = 25;
	var keyPressDy = 20;
	$(document).keydown(function(e){
		var key = e.which;
		if(key == "37") {
			d = "left";
			carPos.x-=keyPressDx;
		} else if(key == "38") {
			d = "up";
			carPos.y-=keyPressDy;
		} else if(key == "39") {
			d = "right";
			carPos.x+=keyPressDx;
		} else if(key == "40") { 
			d = "down";
			carPos.y+=keyPressDy;
		}
	});

	$("#canvas").click(function(e) {
		carPos.x = Math.floor(e.pageX - 15);
		carPos.y = Math.floor(e.pageY - 5);
	});

	var init = function() {
		// setup track
		for(var i = h; i>=0; i -= cw) {
			left_track.push({x: 100, y:i});
			right_track.push({x: w - 100, y: i});
		}
		paint();
		//every 60ms
		if(typeof game_loop != "undefined") {
			clearInterval(game_loop);
		}
		game_loop = setInterval(paint, 60);
	}

	init();
});
