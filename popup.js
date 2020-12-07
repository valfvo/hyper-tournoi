let popup = document.querySelector('.popup');
let popupButton = document.querySelector('.popup-button');
let closeIcon = document.querySelector('.close-icon');

popupButton.onclick = function() {
  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

closeIcon.onclick = function() {
  popup.style.display = 'none';
  document.body.style.overflow = 'scroll';
}

window.onclick = function(event) {
  if (event.target == popup) {
    popup.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }
}
