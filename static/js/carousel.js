let activeIndex = 0;
document.addEventListener('DOMContentLoaded', function() {
  
  const carousel = document.querySelector('[data-carousel]');
 const demoCarousel = document.getElementById('demo-carousel-hero');
  const homeCarouselDemo = document.getElementById('home-carousel-demo');

  fetch('/api/products')
  .then(r => r.json())
  .then(data => {
    products = data;
   

    if(demoCarousel){
    populateCarousel(demoCarousel, 'purses' );
    buildDots();}
    if(homeCarouselDemo){
    populateCarousel(homeCarouselDemo, 'Phone Stands' );
    buildDots();}
  });
 let products = [];


  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/static/css/carousel.css?v=2026-02-05';
  document.head.appendChild(link);

const track = document.querySelector('.carousel-track');



 function getSlides() {
    return track.querySelectorAll('.slide');
  }
  


  
  function getActiveIndex() {
    return Math.round(
      carousel.scrollLeft / carousel.offsetWidth
    );
  }
  function updateDots() {
    [...dotsContainer.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }
  carousel.addEventListener('scroll', () => {
  activeIndex = getActiveIndex();
  updateDots();
});


window.addEventListener('resize', () => {
  carousel.scrollTo({
    left: activeIndex * carousel.offsetWidth
  });
});

function populateCarousel(carousel, group) {
const track = carousel.querySelector('.carousel-track');
track.innerHTML = "";

products
  .filter(p => p.group === group)
  .forEach(p => track.appendChild(createSlide(p)));
}


// slide Adapt to content changes
const observer = new ResizeObserver(() => {
carousel.scrollTo({
  left: activeIndex * carousel.offsetWidth
});
});

observer.observe(carousel);

//populateCarousel(demoCarousel, 'purses' );

  const dotsContainer = document.querySelector('[data-dots]');

function buildDots() {
  dotsContainer.innerHTML = '';

  getSlides().forEach((_, i) => {
    const btn = document.createElement('button');
    btn.addEventListener('click', () => {
      carousel.scrollTo({
        left: i * carousel.offsetWidth,
        behavior: 'smooth'
      });
    });
    dotsContainer.appendChild(btn);
  });
}







//slide factory 

function createSlide(product) {
  const slide = document.createElement('article');
  slide.className = 'slide';
  
  //attach Data -SAFE
  slide.dataset.id = product.id;
  slide.dataset.group = product.group;
  
  slide.innerHTML =`
  <img src="${product.image}" alt="">
  <h3>${product.name}</h3>
  <p>$${product.price.toFixed(2)}</p>
  `;
  return slide
  
};





});
