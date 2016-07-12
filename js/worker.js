//Get averages of color RGB from a ImageData
function getAverages(data) {
  var sumRed = 0;
  var sumGreen = 0;
  var sumBlue = 0;
  var TILE_WIDTH = 16;
  var TILE_HEIGHT = 16;

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

onmessage = function(event) {
  var averages = getAverages(event.data);
  postMessage(averages);
};
