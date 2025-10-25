const track = document.querySelector('.carousel-track');
const prev = document.querySelector('.carousel-btn.prev');
const next = document.querySelector('.carousel-btn.next');
const cards = document.querySelectorAll('.product-card');
let index = 0;

function moveCarousel() {
  const width = cards[0].offsetWidth + 30; // 30px = espaço entre cards
  track.style.transform = `translateX(${-index * width}px)`;
}

next.addEventListener('click', () => {
  if (index < cards.length - 1) index++;
  else index = 0;
  moveCarousel();
});

prev.addEventListener('click', () => {
  if (index > 0) index--;
  else index = cards.length - 1;
  moveCarousel();
});

// movimento automático a cada 4 segundos
setInterval(() => {
  index = (index + 1) % cards.length;
  moveCarousel();
}, 4000);
