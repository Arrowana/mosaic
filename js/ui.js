/*
  UI elements    
*/

document.addEventListener('DOMContentLoaded', loadUI);

function loadUI() {
  document.body.addEventListener('dragenter', dragenter, false);
  document.body.addEventListener('drop', drop, false);
  document.body.addEventListener("dragover", dragover, false);

  var container = document.getElementById('svg-container');
  var toggleButton = document.getElementById('toggle');
  var img = document.getElementById('my-image');

  toggleButton.addEventListener('mouseenter', function(e){
      console.log(e);
      container.style.display = 'none';
      img.classList.remove('hidden');
  });

  toggleButton.addEventListener('mouseleave', function(e){
      console.log(e);
      container.style.display = 'inline-block';
      img.classList.add('hidden');
  });
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
  console.log('Entered');    
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

//Load file from input
function loadFile() {
  var imageFile = this.files[0];
  handleFile(imageFile);
}

function handleFile(imageFile) {
  var reader = new FileReader();
  reader.onload = function(event) {
      var img = document.getElementById('my-image');
      img.src = event.target.result;
  }

  reader.readAsDataURL(imageFile);
}
