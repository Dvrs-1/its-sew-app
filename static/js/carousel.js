const productsPromise = fetch('/api/products').then(r => r.json());
const categoriesPromise = fetch('/api/categories').then(r => r.json());

document.addEventListener('DOMContentLoaded', () => {
  // Load carousel styles once
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/static/css/carousel.css?v=2026-02-17';
  document.head.appendChild(link);

  Promise.all([productsPromise, categoriesPromise])
    .then(([products]) => {
      document
        .querySelectorAll('[data-carousel]')
        .forEach(carousel => {
          initCarousel(carousel, products);
        });
    });
});

function initCarousel(carousel, products) {
  const track = carousel.querySelector('.carousel-track');
  const dotsContainer =
    carousel.nextElementSibling?.matches('[data-dots]')
      ? carousel.nextElementSibling
      : null;

  const nextButton = carousel.querySelector('.next');
  const prevButton = carousel.querySelector('.prev');

  const categoryId = carousel.dataset.category;

  // Populate slides FIRST
  populateCarousel(track, products, categoryId);

  let activeIndex = getActiveIndex();

  buildDots();
  updateDots();
  updateSlideClasses();

  // ---------- BUTTONS ----------

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const slides = getSlides();
      const nextIndex = Math.min(slides.length - 1, activeIndex + 1);
      scrollToSlide(nextIndex);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const prevIndex = Math.max(0, activeIndex - 1);
      scrollToSlide(prevIndex);
    });
  }

  // ---------- KEYBOARD ----------

  carousel.addEventListener('carousel:step', (e) => {
    const direction = e.detail;
    const slides = getSlides();
    const targetIndex = Math.max(
      0,
      Math.min(slides.length - 1, activeIndex + direction)
    );
    scrollToSlide(targetIndex);
  });

  // ---------- SCROLL ENGINE ----------

  function scrollToSlide(index) {
    const slides = getSlides();
    const slide = slides[index];
    if (!slide) return;

    const carouselRect = carousel.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();

    const currentScroll = carousel.scrollLeft;

    const slideCenter = slideRect.left + slideRect.width / 2;
    const carouselCenter = carouselRect.left + carousel.offsetWidth / 2;

    const delta = slideCenter - carouselCenter;

    carousel.scrollTo({
      left: currentScroll + delta,
      behavior: 'smooth'
    });
  }

  // ---------- ACTIVE TRACKING ----------

  carousel.addEventListener('scroll', () => {
    activeIndex = getActiveIndex();
    updateDots();
    updateSlideClasses();
  });

  function getSlides() {
    return track.querySelectorAll('.slide');
  }

  function getActiveIndex() {
    const slides = getSlides();
    if (!slides.length) return 0;

    const carouselCenter =
      carousel.getBoundingClientRect().left +
      carousel.offsetWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, i) => {
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

  function updateSlideClasses() {
    const slides = getSlides();

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
      slide.classList.toggle('is-left', i === activeIndex - 1);
      slide.classList.toggle('is-right', i === activeIndex + 1);

      const img = slide.querySelector('img');
      if (!img) return;

      const rect = slide.getBoundingClientRect();
      const offset = rect.left / carousel.offsetWidth;
      img.style.transform = `translateX(${offset * 5}px)`;
    });
  }

  function updateDots() {
    if (!dotsContainer) return;

    [...dotsContainer.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function buildDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    getSlides().forEach((_, i) => {
      const btn = document.createElement('button');

      btn.addEventListener('click', () => {
        scrollToSlide(i);
      });

      dotsContainer.appendChild(btn);
    });
  }

  // ---------- RESIZE STABILITY ----------

  const observer = new ResizeObserver(() => {
    scrollToSlide(activeIndex);
  });

  observer.observe(carousel);
}

// ---------- DATA POPULATION ----------

function populateCarousel(track, products, categoryId) {
  track.innerHTML = '';

  products
    .filter(p => p.categoryId === categoryId)
    .forEach(p => track.appendChild(createSlide(p)));
}

function createSlide(product) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.dataset.id = product.id;

  const primaryImage = product.images?.find(img => img.role === "primary");

  const price = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;

  const slideOption = document.createElement('div');
  slideOption.className = 'slide-option';

  const showMoreBtn = document.createElement('button');
  showMoreBtn.className = 'show-more';
  showMoreBtn.innerText = "Show More";

  const priceOnSlide = document.createElement('p');
  priceOnSlide.innerHTML = `$${price?.toFixed(2)}`;

  slideOption.append(priceOnSlide, showMoreBtn);

  slide.innerHTML = `
    <div class="slide-media">
      <img src="${primaryImage?.url || product.image}" alt="${primaryImage?.alt || ''}">
    </div>
    <h3>${product.name}</h3>
  `;

  slide.append(slideOption);

  return slide;
}