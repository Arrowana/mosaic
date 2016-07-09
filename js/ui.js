
document.body.addEventListener('dragenter', dragenter, false);
document.body.addEventListener('drop', drop, false);
document.body.addEventListener("dragover", dragover, false);

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

var toggleButton = document.getElementById('toggle');

toggleButton.addEventListener('mouseenter', function(e){
    console.log(e);
    img.classList.remove('hidden');
});

toggleButton.addEventListener('mouseleave', function(e){
    console.log(e);
    img.classList.add('hidden');
});

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

