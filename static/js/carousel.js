const productsPromise = fetch('/api/products')
  .then(r => r.json());
const categoriesPromise = fetch('/api/categories')
.then(r => r.json());

document.addEventListener('DOMContentLoaded', () => {
  // Load carousel styles once
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/static/css/carousel.css?v=2026-02-17';
  document.head.appendChild(link);

  // Initialize all carousels with shared data
  productsPromise.then(products => {
  });
  
 
    Promise.all([productsPromise, categoriesPromise])
    .then(([products, categories]) => {
  
      document
        .querySelectorAll('[data-carousel]')
        .forEach(carousel => {
          initCarousel(carousel, products);
        });
  
    });


    
  });
  
  function initCarousel(carousel, products) {
    const track = carousel.querySelector('.carousel-track');
    const dotsContainer = carousel.nextElementSibling?.matches('[data-dots]')
    ? carousel.nextElementSibling
    : null;



    let activeIndex = 0;
    
    const nextButton = carousel.querySelector('.next');
  const prevButton = carousel.querySelector('.prev');
  
  if(nextButton && prevButton){
  

  const slides = Array.from(track.children);
  let currentIndex = 0;
  
  function updateCarousel() {
  const offset = -currentIndex * 100;
  track.style.transform = `translateX(${offset}%)`;
  }
  
  nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateCarousel();
  });
  
  prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateCarousel();
  });
  }

  carousel.addEventListener("carousel:step", (e) => {
  const direction = e.detail;
  const targetIndex = Math.max(
    0,
    Math.min(getSlides().length - 1, activeIndex + direction)
  );

  scrollToSlide(targetIndex);
});

  const categoryId = carousel.dataset.category;
  populateCarousel(track, products, categoryId);
  buildDots();
  activeIndex = getActiveIndex();
  updateDots();

  function getSlides() {
    return track.querySelectorAll('.slide');
  }

 function getActiveIndex() {
  const carouselCenter =
    carousel.getBoundingClientRect().left +
    carousel.offsetWidth / 2;

  let closestIndex = 0;
  let closestDistance = Infinity;

  getSlides().forEach((slide, i) => {
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    const distance = Math.abs(carouselCenter - slideCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  });

  return closestIndex;
}

  function updateDots() {
    if (!dotsContainer) return;

    [...dotsContainer.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  carousel.addEventListener('scroll', () => {
    activeIndex = getActiveIndex();
   
    updateDots();

     getSlides().forEach((slide, i) => {
        slide.classList.toggle('is-active', i === activeIndex);
       slide.classList.toggle('is-left', i === activeIndex - 1);
      slide.classList.toggle('is-right', i === activeIndex + 1);

       const img = slide.querySelector('img');
    if (!img) return;

    const rect = slide.getBoundingClientRect();
    const offset = rect.left / carousel.offsetWidth;

    img.style.transform = `translateX(${offset * 5}px)`;
  });
  });

  window.addEventListener('resize', () => {
    carousel.scrollTo({
      left: activeIndex * carousel.offsetWidth
    });
  });

  const observer = new ResizeObserver(() => {
    carousel.scrollTo({
      left: activeIndex * carousel.offsetWidth
    });
  });

  observer.observe(carousel);

  function buildDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    getSlides().forEach((_, i) => {
      const btn = document.createElement('button');

      btn.addEventListener('click', () => {

        const slides = getSlides();
  const slide = slides[i];
  if (!slide) return;

  const carouselRect = carousel.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();

  const currentScroll = carousel.scrollLeft;
  const slideCenter =
    slideRect.left + slideRect.width / 2;
  const carouselCenter =
    carouselRect.left + carousel.offsetWidth / 2;

  const delta = slideCenter - carouselCenter;

  carousel.scrollTo({
    left: currentScroll + delta,
    behavior: 'smooth'


        });
      });
      dotsContainer.appendChild(btn);
    });
  }
}



function populateCarousel(track, products, categoryId) {
  track.innerHTML = '';

  products
  .filter(p => p.categoryId === categoryId)
    .forEach(p => track.appendChild(createSlide(p)));
}


// Slide factory
function createSlide(product) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.dataset.id = product.id;
  slide.product = product;

  const primaryImage = product.images?.find(img => img.role === "primary");
  const price = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;

  const slideOption = document.createElement("div");
  slideOption.className = "slide-option"
  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = 'show-more';
  showMoreBtn.innerText = "Show More"

  const priceOnSlide  = document.createElement('p')
  priceOnSlide.innerHTML = `$${price?.toFixed(2)}`;

  slideOption.append(priceOnSlide, showMoreBtn)
  slide.innerHTML = `
    <div class="slide-media">
      <img src="${primaryImage?.url || product.image}" alt="${primaryImage?.alt || ''}">
    </div>
    <h3>${product.name}</h3>
  
    
  `;
slide.append(slideOption)
  return slide;
}

