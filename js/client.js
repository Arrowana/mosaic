//Don't forget to move the import of client.js to the top
var img = document.getElementById('my-image');
img.onload = draw;

var svg = document.getElementById('output-svg');

var inputElement = document.getElementById('input-file');
inputElement.addEventListener('change', loadFile, false);

//Draw image in context to get pixels
function draw() {
  var t0 = performance.now();
  console.log(this);
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  setupSVG(this.width, this.height);

  canvas.width = this.width;
  canvas.height = this.height;
  console.log(this.width+' and '+this.height);

  //Draw image in context to be able to read pixels
  context.drawImage(this, 0, 0);

  //Find number of columns and rows
  var columns = Math.floor(this.width/TILE_WIDTH);
  var rows = Math.floor(this.height/TILE_HEIGHT);

  console.log(['columns:', columns, 'rows:',rows].join(' '));
  generateMosaic(rows, columns, context);

  console.log('Finished mosaic generation in: '+(performance.now()-t0)+' ms');
}

function setupSVG(width, height) {
  //Give to svg the same size as the image
  svg.setAttribute('viewport', '0 0 '+width+' '+height);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
}

//Loop over each tile to create the mosaic
function generateMosaic(rows, columns, context) {
  for(var j = 0; j < rows*TILE_HEIGHT; j+=TILE_HEIGHT) {
    //Iterate over each column
    for(var i = 0; i < columns*TILE_WIDTH; i+=TILE_WIDTH) {
      var averages = getAverages(context.getImageData(i, j, TILE_WIDTH, TILE_HEIGHT).data);
      console.log('Average tile: '+averages);

      svg.appendChild(createTile(averages, i, j));
    }
  }
}

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
