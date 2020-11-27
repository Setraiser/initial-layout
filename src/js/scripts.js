/* Функция для работы с webp форматом */
function testWebP(callback) {

  const webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
  
testWebP((support) => {
  console.log('open')
  if (support == true) {
    document.querySelector('body').classList.add('webp');
  } else {
    document.querySelector('body').classList.add('no-webp');
  }
});
