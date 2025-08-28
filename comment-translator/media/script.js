//script.js
function changeHeading() {
  console.log('running script');
  const titleElement = document.getElementById('title-h1');
  const newText = 'Yay Ithi!';

  if (titleElement.textContent !== newText) {
    titleElement.textContent = newText;
    console.log('Title changed successfully!');
  } else {
    titleElement.textContent = 'This is Ithi';
  }
}
