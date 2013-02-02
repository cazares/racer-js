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

	var paint = function() {
		//ctx.fillText(" ", carPos.x, carPos.y); // clear old car position
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		paint_track();

		ctx.fillText("^", carPos.x, carPos.y); // draw new car position;
	}

	$(document).keydown(function(e){
		var key = e.which;
		if(key == "37") d = "left";
		else if(key == "38") d = "up";
		else if(key == "39") d = "right";
		else if(key == "40") d = "down";

		if(d == "right") carPos.x+=10;
		else if(d == "left") carPos.x-=10;
		else if(d == "up") carPos.y-=10;
		else if(d == "down") carPos.y+=10;
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
