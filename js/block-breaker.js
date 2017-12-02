;
! function(window) {
	"use strict";
	var circleCollisionRect=function(circle,rect){
		//找到距离rect上距离圆心最近的点
		var point = {};
		if(circle.x < rect.x) {
			point.x = rect.x;
		} else if(circle.x > rect.x + rect.w) {
			point.x = rect.x + rect.w;
		} else {
			point.x = circle.x;
		}

		if(circle.y < rect.y) {
			point.y = rect.y;
		} else if(circle.y > rect.y + rect.h) {
			point.y = rect.y + rect.h;
		} else {
			point.y = circle.y;
		}
		var distance = Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2);

		return distance * distance <=circle.r * circle.r;
	};
	var randomInt=function(a,b){
		return Math.floor(Math.random()*Math.abs(a-b))+Math.min(a,b);
	}
	var Game = (function() {
		var Constructor = function(canvas) {
			this.canvas = canvas;
			this.stage;
			this.ball;
			this.paddle;
			this.blockWall;
			document.addEventListener("keydown", this);
			document.addEventListener("keyup", this);
		};
		
		Constructor.prototype = {
			handleEvent: function(evt) {
				if(evt.type==="keyup"){
					switch(evt.keyCode) {
						case 37:
						case 39:
							this.paddle.moveStop();
							break;
					}
				}else if(evt.type==="keydown"){
					switch(evt.keyCode) {
						case 37:
							this.paddle.moveLeft();
							break;
						case 39:
							this.paddle.moveRight();
							break;
					}
				}
			},
			restart: function() {
				//init
				var w = this.canvas.width;
				var h = this.canvas.height;
				this.stage = new Stage(w, h);
				this.paddle = new Paddle(this.stage);
				
				this.ball = new Ball(this.stage);
				this.ball.placeOnPaddleCenter(this.paddle);
				
				this.blockWall = new BlockWall(this.stage);

				var g = this.canvas.getContext("2d");
				var run = function() {
					if(this.detectGameOver()){
						this.gameOver();
						return;
					}
					if(this.detectGameWin()){
						this.gameWin();
						return;
					}
					if(this.blockWall.collisionDetection(this.ball)) {
						this.ball.hitBlock();
					}
					if(this.paddle.collisionDetection(this.ball)){
						this.ball.hitPaddle(this.paddle);
					}
					
					this.stage.draw(g);
					this.blockWall.draw(g);
					this.paddle.draw(g);
					this.ball.draw(g);
					window.requestAnimationFrame(run);
				}.bind(this);
				run();
			},
			detectGameOver:function(){
				var ball=this.ball;
				var paddle=this.paddle;
				if(ball.y-ball.r>=paddle.y){
					return true;
				}
			},
			detectGameWin:function(){
				if(this.blockWall.totalLiveBlock<=0){
					return true;
				}
			},
			gameOver:function(){
				alert("you fail!");
				window.location.reload();
			},
			gameWin:function(){
				alert("you Win!");
				window.location.reload();
			},
			start: function() {
				this.restart();
			}

		};

		return Constructor;
	})();

	var Stage = (function() {
		var Constructor = function(w, h) {
			this.w = w;
			this.h = h;
		}

		Constructor.prototype.draw = function(g) {
			g.clearRect(0, 0, this.w, this.h);
		}
		return Constructor;
	})();

	var Ball = (function() {
		var Constructor = function(stage) {
			this.stage = stage;
			this.r = 10;
			this.x = 0;
			this.y = 0;
			this.maxX = this.stage.w;
			this.maxY = this.stage.h;
			this.speed = 4;
			this.dx = this.speed;
			this.dy = this.speed;

		}
		Constructor.prototype = {
			placeOnPaddleCenter: function(paddle) {
				this.x = paddle.x+paddle.w/2;
				this.y = paddle.y-this.r;
			},
			hitBlock:function(block){
				this.changeDirectionY();
			},
			hitPaddle: function(paddle) {
				this.y=paddle.y-this.r;
				var paddleX3=paddle.x/3;
				if(this.x<paddleX3){//left
					this.x--;
				}else if(this.x>paddleX3*2){//right
					this.x++;
				}else{//center do nothing
					
				}
				
				this.changeDirectionY();
			},
			changeDirectionX:function(){
				this.dx = -this.dx;
			},
			changeDirectionY:function(){
				this.dy = -this.dy;
			}

		};
		Constructor.prototype.draw = function(g) {
			this.x += this.dx;
			this.y += this.dy;
			
			if(this.x + this.r >= this.maxX){
				this.x=this.maxX-this.r;
				this.changeDirectionX();
			}else if (this.x - this.r  <= 0) {
				this.x=this.r;
				this.changeDirectionX();
			}
			
			if(this.y + this.r >= this.maxY){
				this.changeDirectionY();
				this.y=this.maxY-this.r;
			}else if (this.y - this.r  <= 0) {
				this.changeDirectionY();
				this.y=this.r;
			}
			g.beginPath();
			g.arc(this.x, this.y, this.r, 0, Math.PI * 2);
			g.fillStyle = "#0095DD";
			g.fill();

		};
		return Constructor;
	})();

	var Paddle = (function() {
		var Constructor = function(stage) {
			this.stage = stage;
			this.maxX;
			this.maxY;
			this.x;
			this.y;
			this.w;
			this.h;
			this.v;
			this.move=0;//012
			this.reset();
		}
		Constructor.prototype = {
			reset: function() {
				this.w = 100;
				this.h = 10;
				this.maxX = this.stage.w - this.w;
				this.maxY = this.stage.h - this.h;
				this.x = this.maxX / 2;
				this.y = this.maxY - 10;
				this.v = 8;
			},
			moveLeft: function() {
				this.move=1;
			},
			moveStop:function(){
				this.move=0;
			},
			moveRight: function() {
				this.move=2;
			},
			collisionDetection:function(ball){
				if(ball.y+ball.r>=this.y){
					if(this.x<=ball.x&&ball.x<=this.x+this.w){
						return true;
					}
				}
				return false;
				
			}
		}
		Constructor.prototype.draw = function(g) {
			if(this.move===2){
				if(this.x + this.v >= this.maxX) {
					this.x = this.maxX
				} else {
					this.x += this.v;
				}
			}else if(this.move===1){
				if(this.x - this.v <= 0) {
					this.x = 0;
				} else {
					this.x -= this.v;
				}
			}
			g.beginPath();
			g.fillStyle = "red";
			g.fillRect(this.x, this.y, this.w, this.h);
		};
		return Constructor;
	})();

	var Block = (function() {
		var Constructor = function(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		};
		Constructor.prototype = {
			collisionBall: function(ball) {
				return circleCollisionRect(ball,this);
			}
		};

		Constructor.prototype.draw = function(g) {
			g.fillStyle = "black";
			g.fillRect(this.x, this.y, this.w, this.h);
		};
		return Constructor;
	})();

	var BlockWall = (function() {
		var Constructor = function(stage) {
			this.stage = stage;
			this.blocks;
			this.wallPad = 20;
			this.blockPad = 10;
			this.blockW = 100;
			this.blockH = 30;
			this.totalLiveBlock=0;		
			this.reset();
		}
		Constructor.prototype = {
			reset: function() {
				var blockActrulW = this.blockW + this.blockPad;
				var blockActrulH = this.blockH + this.blockPad;
				var rowMaxBlock = Math.floor((this.stage.w - this.blockPad) / blockActrulW);
				var colMaxBlock = Math.floor((this.stage.h/2-this.blockPad) / blockActrulH);
				this.wallPad = (this.stage.w - rowMaxBlock * (blockActrulW)) / 2;

				var blocks = [];
				
				for(var y = 0; y < rowMaxBlock; y++) {
					for(var x = 0; x < rowMaxBlock; x++) {
						var b = new Block(this.wallPad + blockActrulW * x, this.wallPad + y * blockActrulH, this.blockW, this.blockH);
						if(Math.random()>0.8){
							blocks.push(b);
						}
					}
				}
				this.blocks = blocks;
				this.totalLiveBlock=blocks.length;
			},
			collisionDetection: function(ball) {
				var blocks = this.blocks;
				for(var i = blocks.length, b; i-- > 0;) {
					if((b = blocks[i]) !== null) {
						if(b.collisionBall(ball)) {
							blocks[i] = null;
							this.totalLiveBlock--;
							return true;
						}
					}
				}
				return false;
			}
		};
		Constructor.prototype.draw = function(g) {
			var blocks = this.blocks;
			for(var i = blocks.length, b; i-- > 0;) {
				if((b = blocks[i]) !== null) {
					b.draw(g);
				}
			}
		};
		return Constructor;
	})();

	//export
	window.Game = Game;

}(window);