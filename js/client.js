//Don't forget to move the import of client.js to the top
var img = document.getElementById('my-image');
img.onload = draw;

var svg = document.getElementById('output-svg');

var inputElement = document.getElementById('input-file');
inputElement.addEventListener('change', loadFile, false);

var t0;

//Draw image in context to get pixels and generate mosaic
function draw() {
  t0 = performance.now();

  //Remove children of svg to eventually delete previous tiles
  svg.innerHTML = '';

  console.log(this);
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  setupSVG(this.width, this.height);

  canvas.width = this.width;
  canvas.height = this.height;
  console.log(this.width+' and '+this.height);

  //Draw image in context to be able to read pixels
  context.drawImage(this, 0, 0);

  var mosaic = new Mosaic(this.width, this.height, context);
}

function setupSVG(width, height) {
  //Give to svg the same size as the image
  svg.setAttribute('viewBox', '0 0 '+width+' '+height);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
}

//
var Mosaic = function(width, height, context) {
  //Find number of columns and rows
  this.columns = Math.floor(width/TILE_WIDTH);
  this.rows = Math.floor(height/TILE_HEIGHT);

  console.log(['columns:', this.columns, 'rows:', this.rows].join(' '));

  this.context = context;

  //Tile row index
  this.rowIndex = 0;

  var forceSequential = false;
  if(window.Worker && !forceSequential) {
    this.processRow(this.rowIndex);
  }
  else {
    this.generateMosaicSequential();
    showPerf();
  }
};

function showPerf() {
    console.log('Finished mosaic generation in: '+(performance.now()-t0)+' ms');
}

//Loop over each tile to create the mosaic
Mosaic.prototype.generateMosaicSequential = function() {
  for(var j = 0; j < this.rows; j++) {
    //Iterate over each column
    for(var i = 0; i < this.columns; i++) {
      var averages = getAverages(this.getTileData(i, j));
      console.log('Average tile: '+averages);
      showPerf();
    }
  }
};

Mosaic.prototype.finishRow = function(tilesAverage) {
  for(var i = 0; i < this.columns; i++) {
    //svg.appendChild(createTile(averages, i, j));
  }

  this.rowIndex++;
  if(this.rowIndex < this.rows) {
    this.processRow(this.rowIndex);
  }
  else {
    console.log('Mosaic computation finished');
    console.log('Finished mosaic generation in: '+(performance.now()-t0)+' ms');
  }
};

Mosaic.prototype.getTileData = function(column, row) {
  return this.context.getImageData(column*TILE_WIDTH, row*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT).data;
};

Mosaic.prototype.processRow = function(rowIndex) {
  var maxWorkers = navigator.hardwareConcurrency || 4;
  var workers = [];
  var workerIndex = 0;

  var columnIndex = 0;

  var mosaic = this;
  var tilesAverage = [];
  
  function runWorker(worker) {
    worker.onmessage = function(event) {
      tilesAverage.push(event.data);

      columnIndex++;
      if(columnIndex < mosaic.columns) {
        runWorker(worker);
      }
      else {
        worker.terminate();
        worker.finished = true;

        //Returns if some worker are still running
        for(var i = 0; i < workers.length; i++) {
          if (!workers[i].finished) {
              return;
          }
        }

        console.log('Computation on row '+rowIndex+' finished'); 
        mosaic.finishRow(tilesAverage);
      }
    };

    workerIndex++;

    //Send payload to worker to do the computation
    var tileData = mosaic.getTileData(rowIndex, columnIndex);
    worker.postMessage(tileData);
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

//Get averages from a ImageData
var getAverages = function(data) {
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

//Test functions
function tests(){
  console.log(createTile([1, 2, 3], 0, 0));

  console.log(getNode('rect', {width: 100, height: 100}));
}
