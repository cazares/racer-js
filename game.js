var	leftRed = {};
var rightRed = {};

$(document).ready(function(){
    var canvas = $("#canvas")[0];
    context = canvas.getContext("2d");
    w = $("#canvas").width();
    h = $("#canvas").height();
    var scale;

    cw = 10;
    var d;

    var mineOffscreenStartIndex;
    var starOffscreenStartIndex;

    var gameOver = false;

	paint_cell = function(x, y, insideColor) {
		if (!insideColor) {
			insideColor = "green";
		}
		context.fillStyle = insideColor;
		context.fillRect(x, y, cw, cw);
		context.strokeStyle = "black";
		context.strokeRect(x, y, cw, cw);
	}

	var paint = function() {
		if (gameOver) { 
			clearInterval(game_loop);
			//return;
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
			context.fillText("Oh no! You crashed :-(", (w * 0.4) - 80, h / 2);
			context.font = "bold 15px sans-serif";
			var gameOverText = "Tap anywhere to start over";
			context.fillText(gameOverText, w * 0.4 - 125, h / 2 + 30);
			gameOver = true;
		}
		context.fillStyle = "orange";
		context.font = "bold 20px sans-serif";
		context.fillText("Score: " + score, 5, 25);
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
		//var clickX = Math.floor(e.pageX - 15);
		//var clickY = Math.floor(e.pageY - 5);
		var clickX = Math.floor((e.pageX - canvas.offsetLeft) / scale);
		var clickY = Math.floor((e.pageY - canvas.offsetTop) /scale);
		console.log('clickX: ' + clickX + ', clickY: ' + clickY);
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

	var resizeCanvas = function() {
		var currentHeight = window.innerHeight;
		var currentWidth = currentHeight * (w /h);
		console.log('window.innerHeight: ' + currentHeight + ', window.innerWidth: ' + window.innerWidth);
		canvas.style.width = currentWidth + 'px';
		canvas.style.height = currentHeight  + 'px';
		scale = currentHeight / h;
		console.log('canvas width: ' + canvas.style.width + ', canvas height: ' + canvas.style.height);
		var userAgent = navigator.userAgent.toLowerCase();
		var android = userAgent.indexOf('android') > -1 ? true : false;
		var ios = (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) ? true : false;
		// get rid of address bar on android, iphone, and ipad
		if (android || ios) {
			document.body.style.height = (window.innerHeight + 50) + 'px';
		}

		// scroll page after a timeout interval
		window.setTimeout(function() {
			window.scrollTo(0,1);
		}, 1);
	}

	var init = function() {
		touchedMine = false;
		score = 0;
		carWidth = 10;
		carHeight = 10;
		//carPos = { x: 225, y: 425 };
		resizeCanvas();
		carPos = { x: 160, y: 425 };
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
	window.addEventListener('resize', resize, false);
});
