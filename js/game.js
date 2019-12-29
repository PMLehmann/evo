// Setup
const scale = 700;
const threshold = 0.05;
const foodthreshold = 0.13;
const canvas = document.getElementById('canvas');
const canvasGUI = document.getElementById("canvasGUI");

var lastFrameTimeMs = 0,
    maxFPS = 60,
    delta = 0,
    timestep = 1000 / 60;

let mainDivWidth = document.getElementById('main').clientWidth;
let finalwidth = valBetween(mainDivWidth, 300, 1000);
canvas.setAttribute('width', finalwidth);
canvasGUI.setAttribute('width', finalwidth);
let finalHeight = valBetween(window.innerHeight - 140, 400, finalwidth)
canvas.setAttribute('height', finalHeight);
canvasGUI.setAttribute('height', 100);
let ctx = canvas.getContext('2d');
let ctxGUI = canvasGUI.getContext('2d');

let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;
canvas.addEventListener('click', function (event) {
    var x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;

    dropFood(x, y);

}, false);

let terrain = new Terrain(ctx, canvas.width, canvas.height, foodthreshold, threshold, scale);

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
        } while (terrain.getTerrainHeightValue(this.x, this.y) <= foodthreshold);
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

            if (terrain.getTerrainHeightValue(this.x, this.y) < threshold) {
                if (terrain.getTerrainHeightValue(originalx + this.xspeed, originaly) >= threshold) {
                    this.x = originalx + this.xspeed;
                } else {
                    this.x = originalx;
                    this.xspeed = -this.xspeed;
                }

                if (terrain.getTerrainHeightValue(this.x, originaly + this.yspeed) >= threshold) {
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI*2, true);
        ctx.fill();
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
    } while (terrain.getTerrainHeightValue(evox, evoy) <= foodthreshold);
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
                    evoli.pathToFood = calculatePath(terrain.getNode(evoli.x, evoli.y) ,terrain.getNode(evoli.desiredFood.x, evoli.desiredFood.y), terrain.nodes, canvas.width, canvas.height);
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
                if (Math.abs(Math.abs(evoli.x) - (Math.abs(food.x))) < 1 && Math.abs(Math.abs(evoli.y) - Math.abs(food.y)) < 1) {
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

    terrain.draw();

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

function dropFood(x, y) {
    if (terrain.getTerrainHeightValue(x, y) >= foodthreshold) {
        let food = new Food(canvas.width, canvas.height);
        food.x = x;
        food.y = y;
        droppedFood.push(food);
    }
}

function drawGUI() {
    let counter = 1;
    for (let index = 0; index < evolis.length; index++) {
        var evoli = evolis[index];
        ctxGUI.fillStyle = "white";
        ctxGUI.font = "15px Arial";
        if (counter%2!=0) {
            ctxGUI.fillText((index+1) + ". Evoli#" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate + ") (H:" + roundDec(evoli.health, 2) + ")", 10 + ((index/2)*230), 40 - 8);
            ctxGUI.fillStyle = "red";
            ctxGUI.fillRect(10 + ((index/2)*230), 40, 200, 8);
            ctxGUI.fillStyle = "green";
            ctxGUI.fillRect(10 + ((index/2)*230), 40, evoli.health * 2, 8)
        } else {
            ctxGUI.fillText((index+1) + ". Evoli#" + evoli.number + " (S:" + Math.abs(evoli.tempSpeed) + ") (A:" + evoli.ate + ") (H:" + roundDec(evoli.health, 2) + ")", 10 + (((index-1)/2)*230), 2 * 40 - 8);
            ctxGUI.fillStyle = "red";
            ctxGUI.fillRect(10 + (((index-1)/2)*230), 2 * 40, 200, 8);
            ctxGUI.fillStyle = "green";
            ctxGUI.fillRect(10 + (((index-1)/2)*230), 2 * 40, evoli.health * 2, 8)
        }
        counter++;
    }
}

function calculatePath(_start, _end, _nodes, _mapWidth, _mapHeight) {
    return aStar(_start,_end, _nodes, _mapWidth, _mapHeight);
}

window.requestAnimationFrame(gameLoop);