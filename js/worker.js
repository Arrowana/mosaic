//Get averages of color RGB from a ImageData of a complete row
function getAverages(data, tile, rows, columns) {
  var sumRed = 0;
  var sumGreen = 0;
  var sumBlue = 0;
  var TILE_WIDTH = 16;
  var TILE_HEIGHT = 16;

  console.log(tile, rows, columns);
  var tileOffset = tile*TILE_WIDTH*4;

  // i column, j row
  for(var j = 0; j < TILE_HEIGHT; j++) { //row 
    var rowOffset = columns*TILE_WIDTH*4*j;

    for(var i = 0; i < TILE_WIDTH; i++) {
      sumRed += data[rowOffset + i*4 + tileOffset];     
      sumGreen += data[rowOffset + i*4 + tileOffset + 1];
      sumBlue += data[rowOffset + i*4 + tileOffset + 2];
    }
  }

  var averages = [sumRed, sumGreen, sumBlue].map(function(x) { 
    return Math.floor(x/(TILE_WIDTH*TILE_HEIGHT));
  });

  return averages;
}

onmessage = function(event) {
  var a = [];
  console.log(event.data);
  for(var tile = 0; tile < event.data.columns; tile++)
  {
    var averages = getAverages(event.data.rowData, tile, event.data.rows, event.data.columns);
    console.log(averages);
    a.push(averages);
  }

  var response = {};
  response.a = a;
  response.row = event.data.row
  postMessage(response);
};
