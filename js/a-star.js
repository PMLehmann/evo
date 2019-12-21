class Node {
    constructor(x,y, passable) {
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0; 
        this.h = 0;
        this.calculated = false;
        this.closed = false;
        this.passable = passable;
        this.parent;
    }

    reset() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = null;
        this.calculated = false;
        this.closed = false;
    }
}

function getHeap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }

let openList;
let toClean = [];
let endNode;
let mapData;
let mapWidth;
let mapHeight;
let radius;
let startNode;

function aStar(start, end, data, _mapWidth, _mapHeight, _radius) {
    let startTime = performance.now();
    for (let index = 0; index < toClean.length; index++) {
        toClean[index].reset();
    }
    toClean = [];
    if (!start.passable || !end.passable) {
        console.log("start or end not reachable")
        return [];
    }
    openList = getHeap();
    radius = _radius;
    startNode = start;
    console.log(start);
    console.log(end)
    mapWidth = _mapWidth;
    mapHeight = _mapHeight;
    mapData = data;
    endNode = end;
    openList.push(startNode);
    let validationNode;

    while (openList.size() > 0) {
        let currentTime = performance.now()-startTime;
        if (currentTime >40) { // to be removeed after optimizing
            console.log("Exceeding time limit, no valid path found in time. (" + currentTime + ")")
            return []
        }
        let currentNode = openList.pop() //getAndRemoveMinF(openList);
        if (currentNode == null) {
            console.log("no more nodes")
            return []
        }
        if (currentNode == validationNode) {
            console.log("duplicate node")
            return []
        }
        try {
            if (currentNode == endNode) {
                let path = new Array(0)
                let current = currentNode;
                do {
                    path.push(current);
                    current = current.parent;
                }
                while (current != start)
                path.reverse();
                console.log(currentTime);
                return path;
            }
        } catch (error) {
            console.log(error)
            return [];
        }

        currentNode.closed = true;

        expandNode(currentNode);
        toClean.push(currentNode);
        validationNode = currentNode;
    }

    console.log("Empty List")
    return [];
}

function expandNode(currentNode) {

    let neighbours = new Array(0);
    if (currentNode.x >= 2) {
        if (currentNode.y >= 2) {
            let node1 = mapData[((currentNode.y-1)*mapWidth) + (currentNode.x-1)];
            neighbours.push(node1);
        }
        let node2 = mapData[((currentNode.y)*mapWidth) + (currentNode.x-1)];
        neighbours.push(node2);
        let node3 = mapData[((currentNode.y+1)*mapWidth) + (currentNode.x-1)];
        neighbours.push(node3);
    }

    if (currentNode.y >= 2) {
        let node4 = mapData[((currentNode.y-1)*mapWidth) + (currentNode.x)];
        neighbours.push(node4);
        let node5 = mapData[((currentNode.y-1)*mapWidth) + (currentNode.x+1)];
        neighbours.push(node5);
    }

    if (currentNode.y <= mapHeight-1) {
        let node7 = mapData[((currentNode.y+1)*mapWidth) + (currentNode.x)];
        neighbours.push(node7);
        let node8 = mapData[((currentNode.y+1)*mapWidth) + (currentNode.x+1)];
        neighbours.push(node8);
    }

    if (currentNode.x <= mapWidth-1) {
        let node6 = mapData[((currentNode.y)*mapWidth) + (currentNode.x+1)];
        neighbours.push(node6);
    }

    for (let index = 0; index < neighbours.length; index++) {
        let node = neighbours[index];
        if (node == null) {
            continue;
        }
        if (node.closed || !node.passable || calcDistance(startNode.x, startNode.y, node.x, node.y) > (radius+150)) {
            continue;
        }

        let walkCost = 1;

            if (currentNode.x != node.x && currentNode.y != node.y) {
                walkCost = 1.1;
            }
        let gScore = currentNode.g + walkCost;
        let visited = node.calculated;

        if (!visited || gScore < node.g) {
            
            toClean.push(node);
            node.g = gScore;
            node.h = calcDistance(node.x, node.y, endNode.x, endNode.y);
            node.f = node.g + node.h;
            node.parent = currentNode;
            node.calculated = true;

            if (!visited) {
                openList.push(node);
            } else {
                openList.rescoreElement(node);
            }
        }
    
    }

}

function calcDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}