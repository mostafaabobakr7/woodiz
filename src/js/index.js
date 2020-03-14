
console.log('ok')


function increase(e) {
  const numberElement = e.target.previousElementSibling;
  const number = Number(numberElement.innerHTML);
  numberElement.innerHTML = number + 1
}
function decrease(e) {
  const numberElement = e.target.nextElementSibling;
  const number = Number(numberElement.innerHTML);
  // prevent -numbers
  if (number === 0) return;
  numberElement.innerHTML = number - 1
}

[...document.querySelectorAll('.details__customize-card-number-btn-decrease')].forEach(btn => {
  btn.addEventListener('click', decrease)
});
[...document.querySelectorAll('.details__customize-card-number-btn-increase')].forEach(btn => {
  btn.addEventListener('click', increase)
});
