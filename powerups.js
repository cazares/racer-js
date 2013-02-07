var powerUpPercentage = 20;
var minePercentage = 15;

var powerups = [];
var powerupSize = { width: 20, height: 25 };
var mines = [];
var mineSize = { radius: 20 };

var score = 0;

var getRandomPositionInsideTrack = function() {
	if (left_track.length === 0) {
		return { x: 0, y: 0 };
	}
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
