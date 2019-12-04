// Setup

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let canvasGUI = document.getElementById("canvasGUI");
let ctxGUI = canvasGUI.getContext('2d');

var lastFrameTimeMs = 0,
    maxFPS = 60,
    delta = 0,
    timestep = 1000 / 60;

class Evoli {

    constructor(number, x, y, speed) {
        this.number = number;
        this.x = x;
        this.y = y;
        this.w = 5;
        this.h = 5;
        this.speed = speed;
        this.xspeed = 0;
        this.yspeed = 0;
        this.tempSpeed = this.calcSpeed();
        if (this.tempSpeed == 0) {
            this.tempSpeed = 1;
        }
        this.xspeed = this.tempSpeed;
        this.yspeed = this.tempSpeed;
        this.eyeradius = 150;
        this.health = 30;
        this.hungry = 0;
        this.ate = 0;
    }

    calcSpeed() {
        var speed = round((Math.random() * (this.speed * 2)) - this.speed);
        if (speed === 0) {
            return 1;
        } else {
            return speed;
        }
    }

    update(delta) {

        this.hungry+= (0.0001*Math.abs(this.tempSpeed));

        this.x = (this.x + this.xspeed)
        this.y = (this.y + this.yspeed)

        if (this.x > (canvas.width - 5)) {
            this.x = canvas.width - 5;
            this.xspeed = -this.xspeed;
        }

        if (this.y > (canvas.height - 5)) {
            this.y = canvas.height - 5;
            this.yspeed = -this.yspeed;
        }
        if (this.x < 0) {
            this.x = 0
            this.xspeed = -this.xspeed;
        }

        if (this.y < 0) {
            this.y = 0
            this.yspeed = -this.yspeed;
        }

        this.health -= this.hungry;

        if (this.health < 0) {
            this.xspeed = 0;
            this.yspeed = 0;
            this.health = 0;
        }

        if (this.health > 100){
            this.health = 100;
        }
    }
}

// Game

let evolis = new Array(10);
var foodDropped = false;
var foodx = Math.random() * canvas.width;
var foody = Math.random() * canvas.height;

for (let index = 0; index < evolis.length; index++) {
    evolis[index] = new Evoli(index+1,Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5);
}

window.requestAnimationFrame(gameLoop);

function gameLoop(timestamp) {
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(gameLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;
    }
    draw()
    window.requestAnimationFrame(gameLoop);
}

function update(delta) {
    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        evoli.update(delta);
        if (evoli.health <=0) {
            evolis.splice(index, 1);
        }
    }
    if (!foodDropped) {
        foodx = (Math.random() * canvas.width-20)+15;
        foody = (Math.random() * canvas.height-20)+15;
        foodDropped = true;
    }

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        if (calcDistance(evoli.x, evoli.y, foodx, foody) < evoli.eyeradius) {
            var newPos = moveToPoint(foodx,foody,evoli.x,evoli.y, Math.abs(evoli.tempSpeed));
            evoli.xspeed = newPos[0];
            evoli.yspeed = newPos[1];
        }

        if (Math.abs(Math.abs(evoli.x) - (Math.abs(foodx))) < 3 && Math.abs(Math.abs(evoli.y) - Math.abs(foody)) < 3) {
            evoli.health += 30;
            evoli.ate++;
            evoli.hungry = 0;
            if (evoli.health > 100) {
                evoli.health = 100;
            }
            foodDropped = false;
        }
    }

    evolis.sort((a, b) => (a.ate > b.ate) ? -1 : 1)
}

function draw() {

    // misc
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxGUI.clearRect(0, 0, canvasGUI.width, canvasGUI.height);

    // Game
    ctx.fillStyle = "red";
    ctx.fillRect(foodx, foody, 3, 3)

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctx.fillStyle = "blue";
        ctx.fillRect(evoli.x, evoli.y, 5, 5)
        ctx.font = "10px Arial";
        ctx.fillText("#" + evoli.number, evoli.x+10, evoli.y+5);
    }

    // GUI

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctxGUI.fillStyle = "black";
        ctxGUI.font = "15px Arial";
        ctxGUI.fillText("Evoli #" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate +") (H:" + roundDec(evoli.health, 2) + ")", 10, ((index + 1) * 35)-8);
        ctxGUI.fillStyle = "red";
        ctxGUI.fillRect(10, (index + 1) * 35, 200, 8);
        ctxGUI.fillStyle = "green";
        ctxGUI.fillRect(10, (index + 1) * 35, evoli.health*2, 8)
    }

}


//misc

function calcDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.sqrt(a * a + b * b);
}

function moveToPoint(xToGo,yToGo,xCurrent,yCurrent, speed) {
    var delta_x = xToGo - xCurrent;
    var delta_y = yToGo - yCurrent;
    var goal_dist = Math.sqrt( (delta_x * delta_x) + (delta_y * delta_y) )
    
        var ratio = speed / goal_dist;
        var x_move = ratio * delta_x;  
        var y_move = ratio * delta_y;
        //var new_x_pos = x_move + xCurrent; 
        //var new_y_pos = y_move + yCurrent;
        return [x_move,y_move];
    
}

function round(v) {
    return (v >= 0 || -1) * Math.round(Math.abs(v));
}

function roundDec(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}