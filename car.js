var carWidth;// = 10;
var carHeight;// = 10;
var carPos = { x: 160, y: 425 };// = { x: 225, y: 425 };
var touchedMine = false;

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
