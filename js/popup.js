let popup = document.querySelector('.popup');
let popupButton = document.querySelector('.popup-button');
let closeIcon = document.querySelector('.close-icon');

if (popupButton) {
  popupButton.onclick = function() {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

if (closeIcon) {
  closeIcon.onclick = function() {
    popup.style.display = 'none';
    document.body.style.overflow = 'visible';
  }
}

window.onclick = function(event) {
  if (event.target == popup) {
    popup.style.display = 'none';
    document.body.style.overflow = 'visible';
  }
}

const loginPopup = document.querySelector('.login-popup');
if (loginPopup && loginPopup.dataset.wrongCredentials) {
  loginPopup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
