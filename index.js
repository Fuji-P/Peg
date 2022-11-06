"use strict";
let ctx;
let engine;
let timer;
let startTime = 0;
let sound
let score = 0;
let dir = Math.PI / 2;

function rand(v) {
	return Math.floor(Math.random() * v);
}

function init() {
	//エンジン初期化&イベントハンドラ設定
	engine = new Engine(-100, -100, 800, 800, 0, 9.8);
	let canvas = document.getElementById("canvas");
	canvas.onmousemove = mymousemove;
	canvas.onclick = myclick;
	sound = new Audio("sound.mp3");

	//壁
	let r;
	r = new RectangleEntity(-50, 0, 100, 500);
	r.color = "yellow";
	engine.entities.push(r);

	r = new RectangleEntity(550, 0, 100, 500);
	r.color = "yellow";
	engine.entities.push(r);

	//釘
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 8 + i % 2; j++) {
			let x = (j * 50 + 125) - 25 * (i % 2);
			let r = new CircleEntity(x, i * 50 + 100, 5, BodyStatic);
			r.onhit = function (me, peer) {
				if (me.color == "blue") {
					me.color = "red";
					score++;
					sound.pause();
					sound.currentTime = 0;
					sound.play();
					if (score >= 76) {
						clearInterval(timer);
						timer = NaN;
						repaint();
					}
				}
			}
			r.color = "blue";
			engine.entities.push(r);
		}
	}
	//その他(Canvas, Timer)の初期化
	ctx = canvas.getContext("2d");
	ctx.font = "20pt Arial"
	startTime = new Date();
	timer = setInterval(tick, 50);
}

function tick() {
	//物理エンジンの時刻を進める
	engine.step(0.01);
	repaint();
}

function myclick(e) {
	let ball = new CircleEntity(300, 10, 10, BodyDynamic, 0.9);
	ball.velocity.x = 10 * Math.cos(dir);
	ball.velocity.y = 10 * Math.sin(dir);
	ball.color = "yellow";
	engine.entities.push(ball);
}

function mymousemove(e) {
	dir = Math.atan2(e.y, (e.x - 300));
}

function repaint() {
	//背景クリア
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, 600, 600);

	//発射台描画
	ctx.fillStyle = "orange";
	ctx.save();
	ctx.translate(300, 0);
	ctx.rotate(dir);
	ctx.fillRect(-20, -10, 50, 20);
	ctx.restore();

	//ボール・壁・釘の描画
	for (let i = 0; i < engine.entities.length; i++) {
		let e = engine.entities[i];
		ctx.fillStyle = e.color;
		switch (e.shape) {
			case ShapeCircle:
				ctx.beginPath();
				ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
				ctx.closePath();
				ctx.fill();
				break;
			case ShapeRectangle:
				ctx.fillRect(e.x, e.y, e.w, e.h);
				break;
		}
	}

	//各種情報表示
	let elapsed = Math.floor((new Date().getTime() - startTime) / 1000);
	ctx.fillText("score:" + score + "/76", 240, 550);
	ctx.fillText("time:" + ('000' + elapsed).slice(-3), 40, 550);
	if (isNaN(timer)) {
		ctx.fillText("CLEARED!!", 220, 300);
	}
}