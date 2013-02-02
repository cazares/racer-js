$(document).ready(function(){
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

    var cw = 10;
    var d;
    var food;
    var score;

    var left_track;
    var right_track;

    ctx.fillStyle = "black";
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);

	var length = Math.round(h / cw); //Length of the snake
	left_track = []; //Empty array to start with
	right_track = [];

	for(var i = h; i>=0; i -= cw) {
		left_track.push({x: 100, y:i});
		right_track.push({x: w - 100, y: i});
	}

	var paint_cell = function(x, y) {
		ctx.fillStyle = "green";
		ctx.fillRect(x, y, cw, cw);
		ctx.strokeStyle = "black";
		ctx.strokeRect(x, y, cw, cw);
	}

	var paint_track = function() {
		for(var i = 0; i < left_track.length; i++) {
			var left = left_track[i];
			var right = right_track[i];

			paint_cell(left.x, left.y);
			paint_cell(right.x, right.y);
		}
	}
	

	ctx.font = "bold 25px sans-serif";
	var carPos = { x: 225, y: 425 };
	ctx.fillText("^", carPos.x, carPos.y);
	//ctx.fillText("y", 58, 165);

	var ticksSinceLastUpdate = 0;
	var ticksBetweenMoves = 1;
	var update_track = function() {
		var oldLeftEnd = left_track[left_track.length-1];
		var oldRightEnd = right_track[right_track.length-1];
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
		var newLeftEnd = { x: oldLeftEnd.x + (dx * cw / 2), y: oldLeftEnd.y };
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

	var paint = function() {
		//ctx.fillText(" ", carPos.x, carPos.y); // clear old car position
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		update_track();

		paint_track();

		ctx.fillText("^", carPos.x, carPos.y); // draw new car position;
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
		paint();
		//every 60ms
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 60);
	}

	init();
});
