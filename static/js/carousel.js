const productsPromise = fetch('/api/products').then(r => r.json());
const categoriesPromise = fetch('/api/categories').then(r => r.json());

document.addEventListener('DOMContentLoaded', () => {

  
  Promise.all([productsPromise, categoriesPromise])
  .then(([products, categories]) => {
    document
    .querySelectorAll('[data-carousel]')
    .forEach(carousel => {
      initCarousel(carousel, products);
      
    });

    document.querySelectorAll('[data-product-id]').forEach(el => {
  const id = el.dataset.productId;
  const product = products.find(p => Number(p.id) === Number(id));
  if (product) {
    el.append(createProductCard(product));
  }
});
  });
});




function createProductCard(product) {
  const productCard = document.createElement('figure');
  productCard.className = 'special-product-card';
  productCard.dataset.id = product.id;

  // ----- Image -----
  const primaryImage = product.images?.find(img => img.role === "primary");

  const imgEl = document.createElement('img');
  imgEl.className = 'special-product-card-img'
  imgEl.src = primaryImage?.url || '';
  imgEl.alt = primaryImage?.alt || product.name;

  // ----- Price -----
  const price = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;

  const priceEl = document.createElement('p');
  priceEl.className = 'special-product-card-price';
  priceEl.textContent = `$${price?.toFixed(2)}`;

  const figcaption = document.createElement('figcaption');

  figcaption.append(priceEl)

  // ----- Append -----
  productCard.append(imgEl, figcaption);

  return productCard;
}

  function createProductSlide(product) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.id = product.id;
    
    const primaryImage = product.images?.find(img => img.role === "primary");
    
    const price = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;
    
    const slideOption = document.createElement('div');
    slideOption.className = 'slide-option';
    
    const slidesCartBtn = document.createElement('button');
    slidesCartBtn.className = 'add-product-from-slide';

    slidesCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();

    
    const variant = product.variants?.[0] || {
    id: product.id,
    price: product.price,
    size: "Default"

  };
  
  handleAddToCart(product, variant);
});


const slideCartIconImg = document.createElement('i');
slideCartIconImg.innerHTML = `<i class="fa-solid fa-cart-arrow-down"></i>`;

slidesCartBtn.appendChild(slideCartIconImg)

slide.addEventListener("click", () => {
  showProductModal(slide)
});
   //fontawsoms cart button <i class="fa-solid fa-cart-arrow-down"></i>



    const priceOnSlide = document.createElement('p');
    priceOnSlide.innerHTML = `$${price?.toFixed(2)}`;
    
    // append slide button options here i.e showMoreBtn
    slideOption.append(priceOnSlide, slidesCartBtn);
  
    
    slide.innerHTML = `
    <div class="slide-media">
    <img src="${primaryImage?.url || product.image}" 
     class="expand-description"
     alt="${primaryImage?.alt || ''}"
     loading="lazy"
     decoding="async"
     width="400"
     height="500"
     >
    </div>
    <h4>${product.name}</h4>
    `;
    


    slide.append(slideOption);
    
    return slide;
  }



function initCarousel(carousel, products) {  
  
  
  const track = carousel.querySelector('.carousel-track');
  const dotsContainer =
  carousel.nextElementSibling?.matches('[data-dots]')
  ? carousel.nextElementSibling
  : null;
  
  const carouselContainer = carousel.closest('.carousel-container');

    const nextButton = document.createElement('button');
    const prevButton = document.createElement('button');
    
    
    function appendButtons(){
      nextButton.className = 'carousel-btn next';
      nextButton.innerHTML = `&#10095`
      
      prevButton.className = 'carousel-btn prev';
      prevButton.innerHTML = `&#10094`
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
      
      
    };  
    carouselContainer.append(nextButton, prevButton);
    appendButtons(carouselContainer); 

  
  
  
  
  const categoryId = carousel.dataset.category;
  
  // Populate slides FIRST
  

  
  populateCarousel(track, products, categoryId);
  track.classList.add('ready')

  let activeIndex = getActiveIndex();
  
  buildDots();
  updateDots();
  updateSlideClasses();
  
  // ---------- SCROLL ENGINE ----------

  function scrollToSlide(index) {
    const slides = getSlides();
    const slide = slides[index];
    if (!slide) return;

    const carouselRect = carousel.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();

    const currentScroll = carousel.scrollLeft;

    const slideCenter = slideRect.left + slideRect.width / 1.5;
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


  // ---------- AUTO PLAY ----------

function startAutoPlay() {
  return setInterval(() => {
    const slides = getSlides();
    const nextIndex = (activeIndex + 1) % slides.length;
    scrollToSlide(nextIndex);
  }, 4000 + Math.random() * 2000); // 4–6 seconds random
}

let autoPlayInterval;
let userInteracting = false;
let interactionTimeout;

function startAutoPlay() {
  return setInterval(() => {
    if (userInteracting) return;

    const slides = getSlides();
    const nextIndex = (activeIndex + 1) % slides.length;
    scrollToSlide(nextIndex);
  }, 4000 + Math.random() * 2000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

function markUserInteraction() {
  userInteracting = true;

  clearTimeout(interactionTimeout);

  interactionTimeout = setTimeout(() => {
    userInteracting = false;
  }, 4000); // wait 3 seconds after last interaction
}

// ---------- INIT ----------
autoPlayInterval = startAutoPlay();

// ---------- USER EVENTS ----------
carousel.addEventListener('mouseenter', stopAutoPlay);
carousel.addEventListener('mouseleave', () => {
  autoPlayInterval = startAutoPlay();
});

carousel.addEventListener('scroll', markUserInteraction);
carousel.addEventListener('pointerdown', markUserInteraction);
carousel.addEventListener('touchstart', markUserInteraction);

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
      img.style.transform = `translateX(${offset * .5}px)`;
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
  
  // ---------- DATA POPULATION ----------
  
  function populateCarousel(track, products, categoryId) {
    track.innerHTML = '';
  
    products
      .filter(productsCategories => productsCategories.categoryId === categoryId)
      .forEach(productInCategory => track.appendChild(createProductSlide(productInCategory)));
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


  // ---------- RESIZE STABILITY ----------

  const observer = new ResizeObserver(() => {
    scrollToSlide(activeIndex);
  });

  observer.observe(carousel);
}
