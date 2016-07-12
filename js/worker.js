onmessage = function(event) {
  var averages = getAverage(event.data);
  postMessage(averages);
};

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

function work() {
  //Code to parallelise
  var l = 50000000;
  var tab = [];

  //on remplit un tableau
  for(var i = 0; i < l; i++){
  //À chaque itération la mémoire consommée augmente
    tab.push("message");

  //tous les 100 tours, on informe le thread principal
    if(i%100 === 0){
      postMessage(i);
    }
  }
}

