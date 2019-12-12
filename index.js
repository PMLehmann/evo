// Setup
let scale = 756;
let threshold = 0.005;
let foodthreshold = 0.2;
let mainDivWidth = document.getElementById('main').clientWidth;
let canvas = document.getElementById('canvas');
console.log(main.width)
let finalwidth = valBetween(mainDivWidth*0.71, 300, 710);
canvas.setAttribute('width', finalwidth);
let finalHeight = valBetween(window.innerHeight-40, 400, finalwidth)
canvas.setAttribute('height', finalHeight);
let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;
canvas.addEventListener('click', function(event) {
    var x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;

    dropFood(x,y);

}, false);
let ctx = canvas.getContext('2d');
let canvasGUI = document.getElementById("canvasGUI");
canvasGUI.setAttribute('height', finalHeight);
let ctxGUI = canvasGUI.getContext('2d');

var lastFrameTimeMs = 0,
    maxFPS = 60,
    delta = 0,
    timestep = 1000 / 60;

class Food {
    constructor(width, height) {
        this.x, this.y;
        do {
            do {
                this.x = (Math.random() * width-10)+1;
            } while (this.x >= (width-10) || this.x <= 10 );
            do {
                this.y = (Math.random() * height-10)+1;
            } while (this.y >= (height-10) || this.y <= 10);
        } while (getTerrainHeightValue(this.x,this.y) <= foodthreshold*3);
    }
}

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
        this.eyeradius = (Math.random()*250)+100;
        this.health = 50;
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

        this.hungry+= (0.0001*Math.abs(this.tempSpeed*this.tempSpeed));

        var originalx = this.x;
        var originaly = this.y;

        this.x = (this.x + this.xspeed)
        this.y = (this.y + this.yspeed)

        if (getTerrainHeightValue(this.x, this.y) <= threshold) {
            if (getTerrainHeightValue(originalx+this.xspeed, originaly) >= threshold) {
                this.x= originalx + this.xspeed;
            } else {
                this.x= originalx;
                this.xspeed = -this.xspeed;
            }
            
            if (getTerrainHeightValue(this.x, originaly+this.yspeed) >= threshold) {
                this.y = originaly + this.yspeed;
            } else {
                this.y = originaly;
                this.yspeed=  -this.yspeed;
            }
        }

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
var terrain = new Array(canvas.width*canvas.height);
var simplex = new SimplexNoise();
var simplexDistortion = new SimplexNoise();
var simplexDistortion2 = new SimplexNoise();
for (let line = 0; line < canvas.height; line++) {
    for (let pixel = 0; pixel < canvas.width; pixel++) {
        terrain[(line*canvas.width)+pixel] = simplex.noise2D(pixel/scale, line/scale) + simplexDistortion.noise2D(pixel/(scale/3), line/(scale/3)) + simplexDistortion2.noise2D(pixel/(scale/2), line/(scale/2));
    }
}
var imgdata = ctx.getImageData(0,0, canvas.width, canvas.height);
var imgdatalen = imgdata.data.length;


for(var i=0;i<imgdatalen/4;i++){  //iterate over every pixel in the canvas
    if (terrain[i] >= 0.85*3) {
        imgdata.data[4*i] = 255;    // RED (0-255)
        imgdata.data[4*i+1] = 255;    // GREEN (0-255)
        imgdata.data[4*i+2] = 255;    // BLUE (0-255)
    } else if (terrain[i] >= 0.75*3) {
        imgdata.data[4*i] = 109;    // RED (0-255)
        imgdata.data[4*i+1] = 39;    // GREEN (0-255)
        imgdata.data[4*i+2] = 0;    // BLUE (0-255)
    } else if (terrain[i] >= 0.70*3) {
        imgdata.data[4*i] = 139;    // RED (0-255)
        imgdata.data[4*i+1] = 69;    // GREEN (0-255)
        imgdata.data[4*i+2] = 19;    // BLUE (0-255)
    } else if (terrain[i] >= 0.6*3) {
        imgdata.data[4*i] = 205;    // RED (0-255)
        imgdata.data[4*i+1] = 133;    // GREEN (0-255)
        imgdata.data[4*i+2] = 63;    // BLUE (0-255)
    } else if (terrain[i] >= 0.5*3) {
        imgdata.data[4*i] = 34;    // RED (0-255)
        imgdata.data[4*i+1] = 139;    // GREEN (0-255)
        imgdata.data[4*i+2] = 34;    // BLUE (0-255)
    } else if (terrain[i] >= 0.4*3) {
        imgdata.data[4*i] = 0;    // RED (0-255)
        imgdata.data[4*i+1] = 169;    // GREEN (0-255)
        imgdata.data[4*i+2] = 60;    // BLUE (0-255)
    } else if (terrain[i] >= 0.3*3) {
        imgdata.data[4*i] = 0;    // RED (0-255)
        imgdata.data[4*i+1] = 255;    // GREEN (0-255)
        imgdata.data[4*i+2] = 0;    // BLUE (0-255)
    } else if (terrain[i] >= foodthreshold*3) {
        imgdata.data[4*i] = 255;    // RED (0-255)
        imgdata.data[4*i+1] = 255;    // GREEN (0-255)
        imgdata.data[4*i+2] = 102;    // BLUE (0-255)
    } else if (terrain[i] >= threshold) {
        imgdata.data[4*i] = 0;    // RED (0-255)
        imgdata.data[4*i+1] = 0;    // GREEN (0-255)
        imgdata.data[4*i+2] = 255;    // BLUE (0-255)
    } else {
        imgdata.data[4*i] = 0;    // RED (0-255)
        imgdata.data[4*i+1] = 0;    // GREEN (0-255)
        imgdata.data[4*i+2] = 150;    // BLUE (0-255)
    }
    imgdata.data[4*i+3] = 255;  // APLHA (0-255)
}

var total = 1;
let evolis = new Array(10);
let droppedFood = new Array(1);
droppedFood[0] = new Food(canvas.width, canvas.height);

for (let index = 0; index < evolis.length; index++) {
    var evox,evoy;
    do {
        do {
            evox = (Math.random() * canvas.width-10)+1;
        } while (evox >= (canvas.width-10) || evox <= 10 );
        do {
            evoy = (Math.random() * canvas.height-10)+1;
        } while (evoy >= (canvas.height-10) || evoy <= 10);
    } while (getTerrainHeightValue(evox,evoy) <= 0.2);
    evolis[index] = new Evoli(total++,evox, evoy, Math.random() * 5);
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

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        if (evoli.health<= 80) {
            for (let index = 0; index < droppedFood.length; index++) {
                let food = droppedFood[index];
                if (calcDistance(evoli.x, evoli.y, food.x, food.y) < evoli.eyeradius) {
                    var newPos = moveToPoint(food.x,food.y,evoli.x,evoli.y, Math.abs(evoli.tempSpeed));
                    evoli.xspeed = newPos[0];
                    evoli.yspeed = newPos[1];
                }
            }

            if (droppedFood.length>=1) {
                let index = droppedFood.length;
                while (index--) {
                    let food = droppedFood[index];
                    if (Math.abs(Math.abs(evoli.x) - (Math.abs(food.x))) < 5 && Math.abs(Math.abs(evoli.y) - Math.abs(food.y)) < 5) {
                        evoli.health += 30;
                        evoli.ate++;
                        evoli.hungry = 0;
                        if (evoli.health > 100) {
                            evoli.health = 100;
                        }
                        droppedFood.splice(index, 1);
                    }
                }
            }
        }
    }

    if (droppedFood.length==0) {
        droppedFood[0] = new Food(canvas.width, canvas.height);
    } 

    // reproduce

    var newEvolis = new Array(0);
    for (let index = 0; index < evolis.length; index++) {
        var evoliFather = evolis[index];
        for (let index1 = 0; index1 < evolis.length; index1++) {
            if (index!=index1) {
                var evoliMother = evolis[index1];
                if (Math.abs(evoliFather.x-evoliMother.x) < 5 && Math.abs(evoliFather.y-evoliMother.y) < 5) {
                    if (evoliFather.health > 50 && evoliMother.health > 50) {
                        var babyEvoli = new Evoli(total++, evoliFather.x, evoliMother.y, (Math.abs(evoliFather.tempSpeed) + Math.abs(evoliMother.tempSpeed)));
                        evoliMother.health-=25;
                        evoliFather.x+=5;
                        evoliMother.x+=-5;
                        newEvolis.push(babyEvoli);
                        break;
                    }
                }
            }
        }
    }

    Array.prototype.push.apply(evolis, newEvolis);

    evolis.sort((a, b) => (a.ate > b.ate) ? -1 : 1)
}

function draw() {

    // misc
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxGUI.clearRect(0, 0, canvasGUI.width, canvasGUI.height);

    // Game
    // terrain

    drawTerrain();

    for (let index = 0; index < droppedFood.length; index++) {
        let food = droppedFood[index];
        ctx.fillStyle = "black";
        ctx.fillRect(food.x, food.y, 5, 5)
    }

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctx.fillStyle = "red";
        ctx.fillRect(evoli.x, evoli.y, 5, 5)
        ctx.font = "10px Arial";
        ctx.fillText("#" + evoli.number, evoli.x+10, evoli.y+5);
    }

    // GUI
    drawGUI();
}

function drawTerrain() {
    ctx.putImageData(imgdata,0,0);
}

function dropFood(x,y) {
    if (getTerrainHeightValue(x,y) >= foodthreshold*3) {
        let food = new Food(canvas.width, canvas.height);
        food.x = x;
        food.y = y;
        droppedFood.push(food);
    }
}

function getTerrainHeightValue(x, y) {
    return (simplex.noise2D(x/scale, y/scale) + simplexDistortion.noise2D(x/(scale/3), y/(scale/3)) + simplexDistortion2.noise2D(x/(scale/2), y/(scale/2)));
}


function drawGUI() {
    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctxGUI.fillStyle = "white";
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

function valBetween(v, min, max) {
    return (Math.min(max, Math.max(min, v)));
}