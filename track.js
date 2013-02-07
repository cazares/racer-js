var left_track = [];
var right_track = [];

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

var ticksSinceLastUpdate = 0;
var ticksBetweenMoves = 1;
var update_track = function() {
	if (left_track.length === 0) {
		return;
	}
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
