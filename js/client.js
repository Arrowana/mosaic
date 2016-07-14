/*

*/

var forceSequential = false; //Can force sequential computation to compare

document.addEventListener('DOMContentLoaded', load);

function load() {
  var img = document.getElementById('my-image');
  img.onload = draw;

  var inputElement = document.getElementById('input-file');
  inputElement.addEventListener('change', loadFile, false);
}

//Draw image in context to get pixels and generate mosaic
function draw() {
  var svg = document.getElementById('output-svg');

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  setupSVG(svg, this.width, this.height);

  canvas.width = this.width;
  canvas.height = this.height;
  console.log('Widht: '+this.width+', Height: '+this.height);

  //Draw image in context to be able to read pixels
  context.drawImage(this, 0, 0);

  var mosaic = new Mosaic(this.width, this.height, context, svg);
}

//Set viewBox and width and height to allow responsive SVG
function setupSVG(svg, width, height) {
  //Remove children of svg to eventually tiles from the previous image
  svg.innerHTML = '';

  //Give to svg the same size as the image
  svg.setAttribute('viewBox', '0 0 '+width+' '+height);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
}

//Mosaic class generate tiles and put them into the svg
var Mosaic = function(width, height, context, svg) {
  //Find number of columns and rows
  this.columns = Math.floor(width/TILE_WIDTH);
  this.rows = Math.floor(height/TILE_HEIGHT);

  this.svg = svg;

  console.log(['columns:', this.columns, 'rows:', this.rows].join(' '));
  this.context = context;

  if(window.Worker && !forceSequential) {
    this.processImg(this.rowIndex);
  }
  else {
    this.generateMosaicSequential();
    showPerf();
  }
};


//Loop over each tile to create the mosaic
Mosaic.prototype.generateMosaicSequential = function() {
  for(var j = 0; j < this.rows; j++) {
    var docFrag = document.createDocumentFragment();

    //Iterate over each column
    for(var i = 0; i < this.columns; i++) {
      var averages = getAverages(this.getTileData(i, j));
      console.log('Average tile: '+averages);
      docFrag.appendChild(createTile(averages, i*TILE_WIDTH, j*TILE_HEIGHT));
    }

    //append tiles for the row in one shot
    this.svg.appendChild(docFrag);
  }
};

//Get tile Uint8ClampedArray for row and column
Mosaic.prototype.getTileData = function(column, row) {
  return this.context.getImageData(column*TILE_WIDTH, row*TILE_HEIGHT,
    TILE_WIDTH, TILE_HEIGHT).data;
}

//Get row Uint8ClampedArray for a whole row of tiles
Mosaic.prototype.getRowData = function(row) {
  return this.context.getImageData(0, row*TILE_HEIGHT, 
    this.columns*TILE_WIDTH, TILE_HEIGHT).data;
};

//Add row tiles into SVG given averages in an array
Mosaic.prototype.createRow = function(averagesArray, row) {
  var docFrag = document.createDocumentFragment();

  for(var i = 0; i < averagesArray.length; i++) {
    docFrag.appendChild(createTile(averagesArray[i], i*TILE_WIDTH, row*TILE_HEIGHT));
  }

  this.svg.appendChild(docFrag);
};


//Send U8IntClampArray of each row to a worker to compute the average color on each tile
Mosaic.prototype.processImg = function() {
  var maxWorkers = navigator.hardwareConcurrency || 4;
  var workers = [];

  var mosaic = this;
  var row = 0;
  
  function runWorker(worker) {
    worker.onmessage = function(event) {
      console.log(event.data);
      mosaic.createRow(event.data.averagesArray, event.data.row);

      row++;
      if(row < mosaic.rows) {
        console.log('work for:'+row);
        runWorker(worker);
      }
      else {
        worker.terminate();

        console.log('Worker terminates'); 
      }
    };

    var payload = {};
    //Send payload to worker to do the computation
    payload.rowData = mosaic.getRowData(row);
    payload.row = row; //To label
    payload.columns = mosaic.columns;
    payload.rows = mosaic.rows;

    console.log('Send row' + row + ' data to worker');
    worker.postMessage(payload);
  }

  //Start as many workers as cores available
  for(var i = 0; i < maxWorkers; i++) { 
    var worker = new Worker('js/worker.js');
    workers.push(worker);

    runWorker(worker);
  }
};

//Generate tile given rgbArray, position and tile specs
function createTile(rgbArray, i, j) {
  var rgb = 'rgb(' + rgbArray + ')';
  return getNode('ellipse', {cx: TILE_WIDTH/2+i, cy: TILE_HEIGHT/2+j, rx: TILE_WIDTH/2, ry: TILE_HEIGHT/2, fill: rgb});
}

//Get averages from a Uint8ClampedArray for a tile
function getAverages(data) {
  var sumRed = 0;
  var sumGreen = 0;
  var sumBlue = 0;

  for (var i = 0; i < data.length; i += 4) {
    sumRed += data[i];     
    sumGreen += data[i + 1];
    sumBlue += data[i + 2];
  }

  var averages = [sumRed, sumGreen, sumBlue].map(function(x) { 
    return Math.floor(x/(TILE_WIDTH*TILE_HEIGHT));
  });
  return averages;
}

//Helper function to create a node n with the attributes v for svg
function getNode(n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v)
    n.setAttributeNS(null, p, v[p]);
  return n
}

function showPerf() {
  console.log('Finished mosaic generation in: '+(performance.now()-t0)+' ms');
}

//Test functions
function tests(){
  console.log(createTile([1, 2, 3], 0, 0));

  console.log(getNode('rect', {width: 100, height: 100}));
}
