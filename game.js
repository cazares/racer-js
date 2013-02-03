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

    var powerups = [];
    var powerupSize = { width: 20, height: 25 };
    var mines = [];
    var mineSize = { radius: 20 };

    var mineOffscreenStartIndex;
    var starOffscreenStartIndex;

	var carWidth;// = 10;
	var carHeight;// = 10;
    var carPos;// = { x: 225, y: 425 };
    var gameOver = false;
    var score;
    var powerUpPercentage = 20;
    var minePercentage = 15;
    var touchedMine = false;

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
				leftRed.right = left.x + cw;
				rightRed.left = rightRed.x = right.x;
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

	var getRandomPositionInsideTrack = function() {
		var bounds = { 
			left: left_track[left_track.length-1].x + cw + powerupSize.width, 
			right: right_track[right_track.length-1].x - powerupSize.width
		};
		var trackWidth = bounds.right - bounds.left;
		var offset = Math.round(Math.random() * trackWidth);
		return { x: bounds.left + offset, y: left_track[left_track.length-1].y };
	}

	var create_mines = function() {
		var roll = Math.round(Math.random() * (100 / minePercentage));
		if (roll !== 0) {
			return;
		}
		var minePosition = getRandomPositionInsideTrack();
		mines.push(minePosition);
	}

	var create_powerups = function() {
		var roll = Math.round(Math.random() * (100 / powerUpPercentage));
		if (roll !== 0) {
			return; // no powerup created this roll
		}
		var powerupPosition = getRandomPositionInsideTrack();
		powerups.push(powerupPosition);
	}

	var offScreenCount = 0;
	var update_mines = function() {
		var shouldShift = false;
		for(var i = 0; i < mines.length; i++) {
			var mine = mines[i];
			mine.y += cw;

			if (!shouldShift && (mine.y - mineSize.radius) > h) {
				shouldShift = true;
			}
		}
		if (shouldShift) {
			mines.shift();
		}
	}

	var update_powerups = function() {
		var shouldShift = false;
		for(var i = 0; i < powerups.length; i++) {
			var powerup = powerups[i];
			powerup.y += cw;

			if (!shouldShift && (powerup.y - powerupSize.height) > h) {
				shouldShift = true;
			}
		}
		if (shouldShift) { 
			powerups.shift();
		}
	}

	var pentagonPointsAroundCenter = function(center, size) {
		var points = [];
		var halfWidth = size.width / 2;
		var halfHeight = size.height / 2;
		var quarterHeight = size.height / 4;
		points.push({ x: center.x - halfWidth, y: center.y - quarterHeight }); // p1
		points.push({ x: center.x + halfWidth, y: center.y - quarterHeight }); // p2
		points.push({ x: center.x - halfWidth, y: center.y + halfHeight }); // p3
		points.push({ x: center.x, y: center.y - halfHeight }); // p4
		points.push({ x: center.x + halfWidth, y: center.y + halfHeight }); // p5
		return points;
	}

	var drawShapeFromPoints = function(points) {
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for(var i=1; i < points.length; i++) {
			context.lineTo(points[i].x, points[i].y);
		}
		// finish by drawing a line back to the beginning
		context.lineTo(points[0].x, points[0].y);
		context.fillStyle = "yellow";
		context.strokeStyle = "yellow";
		context.fill();
		context.stroke();
		context.closePath();
	}

	var didTouchItem = function(item, overlap) {
		var carTop = carPos.top + overlap;
		var fromTop = item.bottom > carTop;
		var fromLeft = item.right > (carPos.left + (overlap / 2));
		var fromRight = item.left < (carPos.right - (overlap / 2));
		var fromBottom = item.top < carPos.bottom;
		return fromTop && fromBottom && fromLeft && fromRight;
	}

	var draw_powerups = function() {
		for(var i=0; i < powerups.length; i++) {
			var powerup = powerups[i];
			var points = pentagonPointsAroundCenter(powerup, powerupSize);
			powerup.left = powerup.x - powerupSize.width;
			powerup.right = powerup.x + powerupSize.width;
			powerup.top = powerup.y - powerupSize.height;
			powerup.bottom = powerup.y + powerupSize.height;

			if (didTouchItem(powerup, powerupSize.width) && !powerup.grabbed) {
				powerup.grabbed = true;
				carWidth+=2;
				carHeight+=2;
				score+=5;
			}
			else if (!powerup.grabbed){
				drawShapeFromPoints(points);
			}
		}
	}

	var draw_mines = function() {
		for(var i=0; i < mines.length; i++) {
			var mine = mines[i];
			mine.top = mine.y - mineSize.radius;
			mine.bottom = mine.y + mineSize.radius;
			mine.left = mine.x - mineSize.radius;
			mine.right = mine.x + mineSize.radius;
			if (didTouchItem(mine, mineSize.radius / 2) && !mine.grabbed) {
				mine.grabbed = true;
				if (carWidth > 5 && carHeight > 5) {
					carWidth-=2;
					carHeight-=2;	
				}
				score-=3;
				touchedMine = true;
			}
			else if (!mine.grabbed) {
				context.beginPath();
				context.arc(mine.x, mine.y, mineSize.radius, 0, Math.PI * 2, false);
				context.fillStyle = "purple";
				context.fill()
				context.stroke();
				context.closePath();
			}
		}
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

	var ticksSinceLastMineTouch = 0; 
	var paint_car = function() {
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
		var p1 = { x: lowerLeftPoint.x, y: carPos.y - (toMoveY / 2) };
		context.lineTo(p1.x, p1.y);
		context.lineTo(carPos.x - (toMoveX / 2), frontOfCar.y);

		context.lineTo(carPos.x + (toMoveX / 2), frontOfCar.y);
		context.lineTo(lowerRightPoint.x, carPos.y - (toMoveY / 2));
		context.lineTo(lowerRightPoint.x, lowerRightPoint.y);
		context.lineTo(lowerLeftPoint.x, lowerLeftPoint.y);
		context.lineTo(p1.x, p1.y);

		context.strokeStyle = "white";
		if (touchedMine) {
			ticksSinceLastMineTouch++;
			if (ticksSinceLastMineTouch > 10) {
				touchedMine = false;
				ticksSinceLastMineTouch = 0;
			}
		}
		context.fillStyle = touchedMine ? "purple" : "green";
		context.fill();
		context.stroke();
		context.closePath();
	}

	var paint = function() {
		if (gameOver) { 
			return;
		}

		context.fillStyle = "black";
		context.fillRect(0, 0, w, h);
		context.strokeStyle = "black";
		context.strokeRect(0, 0, w, h);

		
		update_track();

		paint_track();

		paint_car();

		create_powerups();
		draw_powerups();
		update_powerups();

		create_mines();
		draw_mines();
		update_mines();

		context.fillStyle = "green";
		context.strokeStyle = "green";
		context.font = "bold 10px sans-serif";
		context.fillText("pos.x: " + carPos.x, 5, h - 15);
		context.fillText("pos.y: " + carPos.y, 5, h - 5);
		context.fillStyle = "purple";
		context.fillText("mines: " + mines.length, w - 50, h - 15);
		context.fillStyle = "yellow";
		context.fillText("stars: " + powerups.length, w - 45, h - 5);
		if (leftRed.x && leftRed.y) {
			context.fillStyle = "red";
		    context.fillText("leftRed: " + leftRed.x + ", " + leftRed.y, 5, h - 35);
		}
		if (rightRed.x && rightRed.y) {
			context.fillStyle = "red";
			context.fillText("rightRed: " + rightRed.x + ", " + rightRed.y, 5, h - 25);
		}
		if (check_collisions()) {
			context.fillText("BOOM", 5, h - 45);
			context.font = "bold 20px sans-serif";
			context.fillStyle = "white";
			context.fillText("Oh no! You crashed :-(", w * 0.4 - 60, h / 2);
			context.font = "bold 15px sans-serif";
			var gameOverText = "Press enter or click anywhere to start over.";
			context.fillText(gameOverText, w * 0.4 - 95, h / 2 + 30);
			gameOver = true;
		}
		context.fillStyle = "orange";
		context.font = "bold 20px sans-serif";
		context.fillText("Score: " + score, 5, 25);
	}

	var check_collisions = function() {
		if (carPos.left <= leftRed.right || carPos.right >= rightRed.left) {
			return true;
		}
		return false;
	}

	var keyPressDx = 25;
	var keyPressDy = 20;
	var keepCarInBounds = function() {
		if (carPos.top < 0) {
			carPos.y = carHeight;
		} else if (carPos.left < 0) {
			carPos.x = carWidth;
		} else if (carPos.right > w) {
			carPos.x = w - carWidth;
		} else if (carPos.bottom > h) {
			carPos.y = h - carHeight;
		}
	}
	
	var startOver = function() {
		gameOver = false;
		init();
	}

	$(document).keydown(function(e){
		var key = e.which;

		// reset if game is over but user pressed 'enter'
		if(gameOver && key == 13) {
			startOver();
			return;
		}

		if(key == "37") {
			d = "left";
			if ((carPos.x - keyPressDx) > 0) {
				carPos.x -= keyPressDx;	
			} else {
				carPos.x = carPos.x - carPos.left;
			}
			
		} else if(key == "38") {
			d = "up";
			if ((carPos.y - keyPressDy) > 0) {
				carPos.y -= keyPressDy;
			} else {
				carPos.y = carPos.y - carPos.top;
			}
		} else if(key == "39") {
			d = "right";
			if ((carPos.x + keyPressDx) < w) {
				carPos.x += keyPressDx;
			} else {
				carPos.x = w - (carPos.right - carPos.x);
			}
		} else if(key == "40") { 
			d = "down";
			if ((carPos.y + keyPressDy) < h) {
				carPos.y += keyPressDy;
			} else {
				carPos.y = h - (carPos.bottom - carPos.y);
			}
		}
	});

	$("#canvas").click(function(e) {
		if (gameOver) {
			startOver();
			return;
		}
		var clickX = Math.floor(e.pageX - 15);
		var clickY = Math.floor(e.pageY - 5);
		if (clickX < carPos.left) {
			carPos.x -= keyPressDx;
		} else if (clickX > carPos.right) {
			carPos.x += keyPressDx;
		}

		if (clickY < carPos.top) {
			carPos.y -= keyPressDy;
		} else if (clickY > carPos.bottom) {
			carPos.y += keyPressDy;
		}

		keepCarInBounds();
	});

	var init = function() {
		touchedMine = false;
		score = 0;
		carWidth = 10;
		carHeight = 10;
		carPos = { x: 225, y: 425 };
		// setup track
		left_track = [];
		right_track = [];
		mines = [];
		powerups = [];
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
