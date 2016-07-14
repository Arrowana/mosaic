self.importScripts('mosaic.js')

//Get averages of color RGB from a ImageData of a complete row
function getAverages(data, tile, rows, columns) {
  var sumRed = 0;
  var sumGreen = 0;
  var sumBlue = 0;

  var tileOffset = tile*TILE_WIDTH*4;

  // i column, j row
  for(var j = 0; j < TILE_HEIGHT; j++) { //row 
    var offset = columns*TILE_WIDTH*4*j + tileOffset;

    for(var i = 0; i < TILE_WIDTH; i++) {
      sumRed += data[offset + i*4];     
      sumGreen += data[offset + i*4 + 1];
      sumBlue += data[offset + i*4 + 2];
    }
  }

  var averages = [sumRed, sumGreen, sumBlue].map(function(x) { 
    return Math.floor(x/(TILE_WIDTH*TILE_HEIGHT));
  });

  return averages;
}

onmessage = function(event) {
  var averagesArray = [];

  for(var tile = 0; tile < event.data.columns; tile++) {
    var averages = getAverages(event.data.rowData, tile, event.data.rows, event.data.columns);

    averagesArray.push(averages);
  }

  var response = {};
  response.averagesArray = averagesArray;
  response.row = event.data.row;

  postMessage(response);
};
