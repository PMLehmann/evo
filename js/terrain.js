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
        this.generateHeightMap();
        this.generateTerrain();
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
        ,1);
        if (Number.isNaN(number)) {
            return 0;
        }
        return number;
    }

    generateTerrain() {
        var imgdatalen = this.imgData.data.length;
        for (var i = 0; i < imgdatalen / 4; i++) {  //iterate over every pixel in the canvas
            if (this.heights[i] < this.deepSeaLevel || Number.isNaN(this.heights[i])) {
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 0;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 150;    // BLUE (0-255)
            } else if (this.heights[i] < this.waterLevel) {
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 0;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 255;    // BLUE (0-255)
            } else if (this.heights[i] < 0.3) { // Beach
                this.imgData.data[4 * i] = 255;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 255;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 102;    // BLUE (0-255)
            } else if (this.heights[i] < 0.4) { // Gras
                this.imgData.data[4 * i] = 0;    // RED (0-255)
                this.imgData.data[4 * i + 1] = 255;    // GREEN (0-255)
                this.imgData.data[4 * i + 2] = 0;    // BLUE (0-255)
            } else if (this.heights[i] < 0.5) { // forest
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