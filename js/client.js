//Don't forget to move the import of client.js to the top
//var img = document.getElementById('my-image');
var img = document.getElementById('my-image');
img.onload = draw;

var svg = document.getElementById('output-svg');

var inputElement = document.getElementById('input-file');
inputElement.addEventListener('change', loadFile, false);

//Load file from input
function loadFile(){
  var imageFile = this.files[0];
  handleFile(imageFile);
}

function handleFile(imageFile) {
  console.log(imageFile);

  var reader = new FileReader();
  reader.onload = function(event) {
      img.src = event.target.result;
  }

  reader.readAsDataURL(imageFile);
}

function draw() {
  var t0 = performance.now();
  console.log(this);
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  //Give to svg the same size as the image
  svg.setAttribute('viewport', '0 0 '+this.width+' '+this.height)
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  //svg.setAttribute('width', this.width);
  //svg.setAttribute('height', this.height);

  canvas.width = this.width;
  canvas.height = this.height;
  console.log(this.width+' and '+this.height);

  //Draw image in context to be able to read pixels
  context.drawImage(this, 0, 0);

  //Find number of columns and rows
  var tileSize = 16;
  var columns = Math.floor(this.width/tileSize);
  var rows = Math.floor(this.height/tileSize);

  console.log(['columns:', columns, 'rows:',rows].join(' '));

  for(var j = 0; j < rows*tileSize; j+=16) {
    //Iterate over each column
    for(var i = 0; i < columns*tileSize; i+=16) {
      var averages = getAverages(context.getImageData(i, j, 16, 16).data);
      console.log('Average tile: '+averages);

      createTile(averages, i, j, tileSize);
    }
  }

  console.log('Finished mosaic generation in: '+(performance.now()-t0)+' ms');
}

var createTile = function(rgbArray, i, j, tileSize) {
  var rgb = 'rgb(' + rgbArray + ')';
  var halfTileSize = tileSize/2;
  svg.appendChild(getNode('ellipse', {cx: halfTileSize+i, cy: halfTileSize+j, rx: halfTileSize, ry: halfTileSize, fill: rgb}));
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
    return Math.floor(x/(16*16));
  });
  return averages;
}

//Helper function to create a node n with the attributes v
function getNode(n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v)
    n.setAttributeNS(null, p, v[p]);
  return n
}
