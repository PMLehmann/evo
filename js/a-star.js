class Node {
    constructor(x,y, passable) {
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0; 
        this.h = 0;
        this.passable = passable;
        this.parent;
        //this.passable = getPassable(x,y);
    }

    reset() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = null;
    }
}

let openList = [];
let closedList = [];
let endNode;
let mapData;
let mapWidth;
let mapHeight;
let radius;
let startNode;

function aStar(start, end, data, _mapWidth, _mapHeight, _radius) {
    let startTime = performance.now();
    for (let index = 0; index < data.length; index++) {
        data[index].reset;
    }
    if (!start.passable || !end.passable) {
        console.log("start or end not reachable")
        return [];
    }
    openList = [];
    closedList = [];
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

    while (!openList.isEmpty) {
        let currentTime = performance.now()-startTime;
        if (currentTime >50) { // to be removeed after optimizing
            console.log("Exceeding time limit, no valid path found in time. (" + currentTime + ")")
            return []
        }
        let currentNode = getAndRemoveMinF(openList);
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

        closedList.push(currentNode);

        expandNode(currentNode);
        validationNode = currentNode;
    }

    return [];
}

function getAndRemoveMinF(list) {
    var lowest = Number.POSITIVE_INFINITY;
    var tmp;
    var found;
    for (var i=list.length-1; i>=0; i--) {
        tmp = list[i].f;
        if (tmp < lowest) {
            lowest = tmp;
            found = i;
        }
    }
    let nodeToReturn = list[found];
    list.splice(found, 1);
    return nodeToReturn;
  }

// überprüft alle Nachfolgeknoten und fügt sie der Open List hinzu, wenn entweder
// - der Nachfolgeknoten zum ersten Mal gefunden wird, oder
// - ein besserer Weg zu diesem Knoten gefunden wird
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
        if (closedList.some(nodeInList => nodeInList.x == node.x && nodeInList.y == node.y) || !node.passable || calcDistance(startNode.x, startNode.y, node.x, node.y) > radius) {
            continue;
        }

        let temp = new Node(0,0, false); 

        let walkCost = 1;

        if (currentNode.x != node.x && currentNode.y != node.y) {
            walkCost = 1.1;
        }

        temp.g = currentNode.g + walkCost;
        temp.h = calcDistance(node.x, node.y, endNode.x, endNode.y);
        temp.f = temp.g + temp.h;

        if (openList.some(nodeInList => nodeInList.x == node.x && nodeInList.y == node.y) && temp.g >= node.g) {
            continue
        }

        node.g = temp.g;
        node.h = temp.h;
        node.f = temp.f;
        node.parent = currentNode;
        if (!openList.some(nodeInList => nodeInList.x == node.x && nodeInList.y == node.y)) {
            openList.push(node);
        }
    }

}

function calcDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}