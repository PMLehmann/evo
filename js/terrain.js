class Terrain {
    constructor(_ctx, _width, _height, _waterLevel, _deepSeaLevel, _scale, _seed = 0) {
        this.ctx = _ctx;
        this.width = _width;
        this.height = _height;
        this.nodes = new Array(_width, _height);
        this.heights = new Array(_width, _height);
        this.imgData = _ctx.getImageData(0, 0, _width, _height);
        this.waterLevel = _waterLevel;
        this.deepSeaLevel = _deepSeaLevel;
        this.scale = _scale; 
        if (_seed == 0) {
            _seed = Math.random;
        }
        this.simplex = new SimplexNoise(_seed);
        this.simplexDistortion = new SimplexNoise(_seed);
        this.simplexDistortion2 = new SimplexNoise(_seed);
        this.simplexDistortion3 = new SimplexNoise(_seed);
        this.simplexDistortion4 = new SimplexNoise(_seed);
        this.generateHeightMap();
        this.generateRivers(25);
        this.generateTerrain();
    }

    generateRivers(noOfRivers) {
        for (let index = 0; index < noOfRivers; index++) {
            
            // generate River

            // starting point

            let riversource = {
                x: (Math.random() * this.width - 10) + 1,
                y: (Math.random() * this.height - 10) + 1,
                height: 0
            };

            riversource.height = this.getTerrainHeightValue(riversource.x, riversource.y);

            while (riversource.height >= 0.95 || riversource.height <= 0.7) {
                riversource.x = (Math.random() * this.width - 10) + 1;
                riversource.y = (Math.random() * this.height - 10) + 1;
                riversource.height = this.getTerrainHeightValue(riversource.x, riversource.y);
            }
            this.setTerrainHeightValue(riversource.x, riversource.y, 3);

            // create riverbed by looping neighbors

            // collect neighbors

            let riverstream = {
                x: riversource.x,
                y: riversource.y,
                riverrun: [],
                height: 0.15
            }

            riverstream.riverrun.push([riversource.x, riversource.y])

            let lowestNeighbour = {
                x: -1,
                y: -1,
                height: 2
            }

            let neighborCoords = [
                [-1,-1],
                [0,-1],
                [1,-1],
                [-1,0],
                [1,0],
                [-1,1],
                [0,1],
                [1,1]
            ]

            let neighborCoordsWithoutHex = [
                [0,-1],
                [-1,0],
                [1,0],
                [0,1]
            ]

            let neighborCoordsDiag = [
                [-1,-1],
                [-1,1],
                [1,-1],
                [1,1]
            ]

            let foundSea = false;

            while (!foundSea) {

                lowestNeighbour.height = 4;
            
                for (let index = 0; index < neighborCoords.length; index+= 2) {
                    let coords = neighborCoords[index];
                    let neighborHeight = this.getTerrainHeightValue(riverstream.x+coords[0], riverstream.y+coords[1]);
                    if (neighborHeight <= this.waterLevel || neighborHeight == undefined) {
                        foundSea = true;
                        break;
                    }
                    if (neighborHeight < lowestNeighbour.height && neighborHeight >= this.deepSeaLevel) {
                        lowestNeighbour.x = riverstream.x+coords[0];
                        lowestNeighbour.y = riverstream.y+coords[1];
                        lowestNeighbour.height = neighborHeight;
                    }
                }

                //for (let index = 0; index < neighborCoords.length; index++) {
                //    let coords = neighborCoords[index];
                    //this.setTerrainHeightValue(riverstream.x+coords[0], riverstream.y+coords[1], 3)
                    //this.getNode(riverstream.x+coords[0], riverstream.y+coords[1]).passable = false;
                //}

                if (lowestNeighbour.height != 4 && !foundSea) {
                    riverstream.x = lowestNeighbour.x;
                    riverstream.y = lowestNeighbour.y;
                    this.setTerrainHeightValue(riverstream.x, riverstream.y, 3);
                    riverstream.riverrun.push([riverstream.x, riverstream.y]);
                    //this.getNode(riverstream.x, riverstream.y).passable = false;
                } else {
                    foundSea = true;
                }

                shuffle(neighborCoords);
            }

            // create riverside

            for (let index = 0; index < riverstream.riverrun.length; index++) {
                let riverPos = riverstream.riverrun[index];
                for (let index2 = 0; index2 < neighborCoords.length; index2++) {
                    let coords = neighborCoords[index2];
                    let currentHeight = this.getTerrainHeightValue(riverPos[0]+coords[0], riverPos[1]+coords[1])
                    if (currentHeight != 3 && currentHeight >= this.waterLevel) {
                        this.setTerrainHeightValue(riverPos[0]+coords[0], riverPos[1]+coords[1], 0.15)
                    }
                }
            }
        
        }
    }

    generateHeightMap() {
        for (let line = 0; line < this.height; line++) {
            for (let pixel = 0; pixel < this.width; pixel++) {
                let noise =  this.getNoiseValue(pixel, line);
                this.heights[(line * this.width) + pixel] =  noise;
                this.nodes[(line * this.width) + pixel] =  new Node(pixel, line, this.getPassable(noise));
            }
        }
    }

    getNoiseValue(x, y) {
        let number = Math.pow(
          (1 * this.simplex.noise2D(x / scale, y/ scale)) 
        + (0.5 * this.simplexDistortion.noise2D(x * 2 / scale, y * 2 / scale)) 
        + (0.25 * this.simplexDistortion2.noise2D(x * 4 / scale, y * 4 / scale))
        + (0.125 * this.simplexDistortion3.noise2D(x * 8 / scale, y * 8 / scale))
        + (0.0625 * this.simplexDistortion4.noise2D(x * 16 / scale, y * 16 / scale))
        ,1);
        if (Number.isNaN(number)) {
            return 0;
        }
        return number;
    }

    generateTerrain() {
        var imgdatalen = this.imgData.data.length;
        for (var i = 0; i < imgdatalen / 4; i++) {  //iterate over every pixel in the canvas
            if (this.heights[i] == 3){
                this.imgData.data[4 * i] = 25;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 25;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 255;    // BLUE (0-255)
            } else if (this.heights[i] < this.deepSeaLevel || Number.isNaN(this.heights[i])) {
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 0;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 200;    // BLUE (0-255)
            } else if (this.heights[i] < this.waterLevel) {
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 0;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 255;    // BLUE (0-255)
            } else if (this.heights[i] < 0.18) { // Beach
                this.imgData.data[4 * i] = 255;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 255;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 102;    // BLUE (0-255)
            } else if (this.heights[i] < 0.25) { // Gras
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 255;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 0;    // BLUE (0-255)
            } else if (this.heights[i] < 0.4) { // forest
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 169;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 60;    // BLUE (0-255)
            } else if (this.heights[i] < 0.6) { // deep forest
                this.imgData.data[4 * i] = 34;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 139;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 34;    // BLUE (0-255)
            } else if (this.heights[i] < 0.7) { // low mountains
                this.imgData.data[4 * i] = 205;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 133;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 63;    // BLUE (0-255)
            } else if (this.heights[i] < 0.80) { // middle mountains
                this.imgData.data[4 * i] = 139;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 69;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 19;    // BLUE (0-255)
            } else if (this.heights[i] < 0.95) { // high mountains
                this.imgData.data[4 * i] = 109;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 39;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 0;    // BLUE (0-255)
            } else {
                this.imgData.data[4 * i] = 255;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 255;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 255;    // BLUE (0-255)
            }
            this.imgData.data[4 * i + 3] = 255;  // APLHA (0-255)
        }
    }

    getTerrainHeightValue(x,y) {
        return this.heights[(round(y) * this.width)+ round(x)]
    }

    setTerrainHeightValue(x,y,value) {
        this.heights[(round(y) * this.width)+ round(x)] = value;
    }

    getPassable(value) {
        if (value < this.deepSeaLevel || Number.isNaN(value)) {
            return false;
        }
        return true;
    }

    getNode(x, y) {
        return this.nodes[(round(y) * this.width)+ round(x)];
    }

    draw() {
        this.ctx.putImageData(this.imgData, 0, 0);
    }
 
}