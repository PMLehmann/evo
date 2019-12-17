// Setup
const scale = 756;
const threshold = 0.005;
const foodthreshold = 0.2;
const canvas = document.getElementById('canvas');
const canvasGUI = document.getElementById("canvasGUI");

var lastFrameTimeMs = 0,
    maxFPS = 60,
    delta = 0,
    timestep = 1000 / 60;

let mainDivWidth = document.getElementById('main').clientWidth;
let finalwidth = valBetween(mainDivWidth * 0.71, 300, 710);
canvas.setAttribute('width', finalwidth);
let finalHeight = valBetween(window.innerHeight - 40, 400, finalwidth)
canvas.setAttribute('height', finalHeight);
canvasGUI.setAttribute('height', finalHeight);
let ctx = canvas.getContext('2d');
let ctxGUI = canvasGUI.getContext('2d');

let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;
canvas.addEventListener('click', function (event) {
    var x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;

    dropFood(x, y);

}, false);

class Food {
    constructor(width, height) {
        this.x, this.y;
        do {
            do {
                this.x = (Math.random() * width - 10) + 1;
            } while (this.x >= (width - 10) || this.x <= 10);
            do {
                this.y = (Math.random() * height - 10) + 1;
            } while (this.y >= (height - 10) || this.y <= 10);
        } while (getTerrainHeightValue(this.x, this.y) <= foodthreshold * 3);
    }
    
    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2, true);
        ctx.fill();
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
        this.eyeradius = (Math.random() * 100) + 100;
        this.health = 50;
        this.hungry = 0;
        this.ate = 0;
        this.desiredFood;
        this.pathToFood = [];
        this.unreachableFoods = [];
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

        this.hungry += (0.0001 * Math.abs(this.tempSpeed * this.tempSpeed));

        var originalx = this.x;
        var originaly = this.y;

        if (this.pathToFood.length) {
            for (let index = 0; index < Math.abs(round(this.tempSpeed)); index++) {
                if (this.pathToFood.length > 0) {
                    let node = this.pathToFood[0];
                    this.x = node.x;
                    this.y = node.y;
                    this.pathToFood.splice(node, 1);
                } else {
                    break;
                }
                
            }
        } else {

            this.x = (this.x + this.xspeed)
            this.y = (this.y + this.yspeed)

            if (getTerrainHeightValue(this.x, this.y) <= threshold) {
                if (getTerrainHeightValue(originalx + this.xspeed, originaly) >= threshold) {
                    this.x = originalx + this.xspeed;
                } else {
                    this.x = originalx;
                    this.xspeed = -this.xspeed;
                }

                if (getTerrainHeightValue(this.x, originaly + this.yspeed) >= threshold) {
                    this.y = originaly + this.yspeed;
                } else {
                    this.y = originaly;
                    this.yspeed = -this.yspeed;
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

        }

        this.health -= this.hungry;

        if (this.health < 0) {
            this.xspeed = 0;
            this.yspeed = 0;
            this.health = 0;
        }

        if (this.health > 100) {
            this.health = 100;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 5, 5)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.eyeradius, 0, Math.PI*2, true);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.font = "10px Arial";
        ctx.fillText("#" + this.number, this.x + 10, this.y + 5);
    }
}

// Game
var terrain = new Array(canvas.width * canvas.height);
var simplex = new SimplexNoise();
var simplexDistortion = new SimplexNoise();
var simplexDistortion2 = new SimplexNoise();
let nodes = new Array(canvas.width * canvas.height);
for (let line = 0; line < canvas.height; line++) {
    for (let pixel = 0; pixel < canvas.width; pixel++) {
        let height =  getTerrainHeightValue(pixel, line);
        terrain[(line * canvas.width) + pixel] =  height;
        nodes[(line * canvas.width) + pixel] =  new Node(pixel, line, getPassable(height));
    }
}
var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
var imgdatalen = imgdata.data.length;


for (var i = 0; i < imgdatalen / 4; i++) {  //iterate over every pixel in the canvas
    if (terrain[i] >= 0.85 * 3) {
        imgdata.data[4 * i] = 255;    // RED (0-255)
        imgdata.data[4 * i + 1] = 255;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 255;    // BLUE (0-255)
    } else if (terrain[i] >= 0.75 * 3) {
        imgdata.data[4 * i] = 109;    // RED (0-255)
        imgdata.data[4 * i + 1] = 39;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 0;    // BLUE (0-255)
    } else if (terrain[i] >= 0.70 * 3) {
        imgdata.data[4 * i] = 139;    // RED (0-255)
        imgdata.data[4 * i + 1] = 69;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 19;    // BLUE (0-255)
    } else if (terrain[i] >= 0.6 * 3) {
        imgdata.data[4 * i] = 205;    // RED (0-255)
        imgdata.data[4 * i + 1] = 133;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 63;    // BLUE (0-255)
    } else if (terrain[i] >= 0.5 * 3) {
        imgdata.data[4 * i] = 34;    // RED (0-255)
        imgdata.data[4 * i + 1] = 139;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 34;    // BLUE (0-255)
    } else if (terrain[i] >= 0.4 * 3) {
        imgdata.data[4 * i] = 0;    // RED (0-255)
        imgdata.data[4 * i + 1] = 169;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 60;    // BLUE (0-255)
    } else if (terrain[i] >= 0.3 * 3) {
        imgdata.data[4 * i] = 0;    // RED (0-255)
        imgdata.data[4 * i + 1] = 255;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 0;    // BLUE (0-255)
    } else if (terrain[i] >= foodthreshold * 3) {
        imgdata.data[4 * i] = 255;    // RED (0-255)
        imgdata.data[4 * i + 1] = 255;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 102;    // BLUE (0-255)
    } else if (terrain[i] >= threshold) {
        imgdata.data[4 * i] = 0;    // RED (0-255)
        imgdata.data[4 * i + 1] = 0;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 255;    // BLUE (0-255)
    } else {
        imgdata.data[4 * i] = 0;    // RED (0-255)
        imgdata.data[4 * i + 1] = 0;    // GREEN (0-255)
        imgdata.data[4 * i + 2] = 150;    // BLUE (0-255)
    }
    imgdata.data[4 * i + 3] = 255;  // APLHA (0-255)
}

var total = 1;
let evolis = new Array(10);
let droppedFood = new Array(1);
droppedFood[0] = new Food(canvas.width, canvas.height);

// spawn evolis
for (let index = 0; index < evolis.length; index++) {
    var evox, evoy;
    do {
        do {
            evox = (Math.random() * canvas.width - 10) + 1;
        } while (evox >= (canvas.width - 10) || evox <= 10);
        do {
            evoy = (Math.random() * canvas.height - 10) + 1;
        } while (evoy >= (canvas.height - 10) || evoy <= 10);
    } while (getTerrainHeightValue(evox, evoy) <= 0.2);
    evolis[index] = new Evoli(total++, evox, evoy, Math.random() * 5);
}


function gameLoop(timestamp) {
    if (evolis.length <= 1) {
        showWinner()
    } else {
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
        draw();
        window.requestAnimationFrame(gameLoop);
    }
}

function update(delta) {
    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        evoli.update(delta);
        if (evoli.health <= 0) {
            evolis.splice(index, 1);
        }
    }

    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        if (evoli.health <= 90 && droppedFood.length >= 1) {
            // check if desiredfood is still the closest

            if(evoli.desiredFood != null){
                for (let index1 = 0; index1 < droppedFood.length; index1++) {
                    let food = droppedFood[index1];
                    let distanceToFood = calcDistance(evoli.x, evoli.y, food.x, food.y);
                    if(distanceToFood <= evoli.eyeradius) {
                        if (calcDistance(evoli.x, evoli.y, evoli.desiredFood.x, evoli.desiredFood.y) > distanceToFood) {
                            evoli.desiredFood = null;
                            break;
                        }
                    }
                }
            }

            if (evoli.desiredFood == null || !droppedFood.includes(evoli.desiredFood, 0)) {
                evoli.desiredFood = null;
                evoli.pathToFood = [];
                let closestFoodIndex = -1;
                let closestFoodDistance = 5000;
                for (let index = 0; index < droppedFood.length; index++) {
                    let food = droppedFood[index];
                    if (evoli.unreachableFoods.some(foodInList => foodInList.x == food.x && foodInList.y == food.y)) {
                        continue;
                    }
                    let foodDistance = calcDistance(evoli.x, evoli.y, food.x, food.y);
                    if (foodDistance < evoli.eyeradius && foodDistance <= closestFoodDistance) {
                        closestFoodDistance = foodDistance;
                        closestFoodIndex = index;
                    }
                }

                if (closestFoodIndex != -1) {
                    evoli.desiredFood = droppedFood[closestFoodIndex];
                    evoli.pathToFood = calculatePath(getNode(evoli.x, evoli.y) ,getNode(evoli.desiredFood.x, evoli.desiredFood.y), nodes, canvas.width, canvas.height);
                    if (evoli.pathToFood == []) {
                        evoli.unreachableFoods.push(droppedFood[closestFoodIndex]);
                        evoli.desiredFood = null;
                    }
                }
            }

            let index = droppedFood.length;
            while (index--) {
                let food = droppedFood[index];
                if (evoli.unreachableFoods.some(foodInList => foodInList.x == food.x && foodInList.y == food.y)) {
                    continue;
                }
                if (Math.abs(Math.abs(evoli.x) - (Math.abs(food.x))) < 3 && Math.abs(Math.abs(evoli.y) - Math.abs(food.y)) < 3) {
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

    if (droppedFood.length == 0) {
        droppedFood[0] = new Food(canvas.width, canvas.height);
    }

    // reproduce

    var newEvolis = new Array(0);
    for (let index = 0; index < evolis.length; index++) {
        var evoliFather = evolis[index];
        for (let index1 = 0; index1 < evolis.length; index1++) {
            if (index != index1) {
                var evoliMother = evolis[index1];
                if (Math.abs(evoliFather.x - evoliMother.x) < 5 && Math.abs(evoliFather.y - evoliMother.y) < 5) {
                    if (evoliFather.health > 50 && evoliMother.health > 50) {
                        var babyEvoli = new Evoli(total++, evoliFather.x, evoliMother.y, (Math.abs(evoliFather.tempSpeed) + Math.abs(evoliMother.tempSpeed)));
                        evoliMother.health -= 25;
                        evoliFather.x += 5;
                        evoliMother.x += -5;
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
        droppedFood[index].draw(ctx);
    }

    for (let index = 0; index < evolis.length; index++) {
        evolis[index].draw(ctx);
    }

    // GUI
    drawGUI();
}

function showWinner() {
    ctx.font = "35px Arial";
    if (evolis.length) {
        let evoli = evolis[0];    
        ctx.fillStyle = "black";
        ctx.fillText("Evoli #" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate + ") (H:" + roundDec(evoli.health, 2) + ") survived!", 20, 55);
        ctx.fillStyle = "white";
        ctx.fillText("Evoli #" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate + ") (H:" + roundDec(evoli.health, 2) + ") survived!", 18, 53);
    } else {
        ctx.fillStyle = "black";
        ctx.fillText("No indiviual survived!", 20, 55);
        ctx.fillStyle = "white";
        ctx.fillText("No indiviual survived!", 18, 53);
    }

}

function drawTerrain() {
    ctx.putImageData(imgdata, 0, 0);
}

function dropFood(x, y) {
    if (getTerrainHeightValue(x, y) >= foodthreshold * 3) {
        let food = new Food(canvas.width, canvas.height);
        food.x = x;
        food.y = y;
        droppedFood.push(food);
    }
}

function getTerrainHeightValue(x, y) {
    return (simplex.noise2D(x / scale, y / scale) + simplexDistortion.noise2D(x / (scale / 3), y / (scale / 3)) + Math.sin(simplexDistortion2.noise2D(x / (scale / 2), y / (scale / 2))));
}

function getPassable(value) {
    if (value < threshold) {
        return false;
    }
    return true;
}

function getNode(x, y) {
    return nodes[(round(y) * canvas.width)+ round(x)];
}


function drawGUI() {
    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctxGUI.fillStyle = "white";
        ctxGUI.font = "15px Arial";
        ctxGUI.fillText("Evoli #" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate + ") (H:" + roundDec(evoli.health, 2) + ")", 10, ((index + 1) * 35) - 8);
        ctxGUI.fillStyle = "red";
        ctxGUI.fillRect(10, (index + 1) * 35, 200, 8);
        ctxGUI.fillStyle = "green";
        ctxGUI.fillRect(10, (index + 1) * 35, evoli.health * 2, 8)
    }
}

function calculatePath(_start, _end, _nodes, _mapWidth, _mapHeight) {
    return aStar(_start,_end, _nodes, _mapWidth, _mapHeight);
}

window.requestAnimationFrame(gameLoop);