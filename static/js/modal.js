document.addEventListener('DOMContentLoaded', () => {

  //  Load external cart stylesheet 
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = "/static/css/cartstyles.css?v=2026-03-07";
  document.head.appendChild(link);


  const productMap = new Map();


  const API_BASE = window.location.origin;  // dynamically grabs current host + protocol
 
 fetch(`${window.location.origin}/api/products`)
    .then(res => res.json())
    .then(products => {
      products.forEach(product => {
        productMap.set(String(product.id), product);
      });
  
     // renderGallery(products);
    })
    .catch(err => {
      console.error("Failed to load products", err);
    });

  const modalContainer = document.getElementById("modal-view-container");
  const miniCart = document.getElementById("mini-cart");
  const miniCartItems = document.getElementById("mini-cart-items");
  const miniCartOpenBtn = document.getElementById("mini-cart-open");

  let miniCartTimeout;
   
  //User Card Cart Summmary
      const cartSummary = document.getElementById("cart-total");

      function updateCartTotals() {
        if (!cartSummary) 
          return;
      
        if (Cart.isEmpty()) {
          cartSummary.textContent = "Empty $0.00";
          return;
        }
      
        const { count, price} = Cart.totals();
      
        cartSummary.innerHTML = `
        <p><strong>Total Price:</strong> $${price.toFixed(2)}</p>
        `;
      }

      Cart.subscribe(() => {

          if (miniCart && miniCart.classList.contains("show")) {
          buildCartItems(miniCartItems);
          }
        updateCartTotals();
      });
      updateCartTotals()

 window.handleAddToCart = function(product, variant) {
  const alreadyInCart =
    Cart.getItems().some(item => item.id === String(variant.id));

  if (alreadyInCart) {
    const confirmDup = confirm(
      `"${product.name}" is already in your cart.\nAdd another?`
    );
    if (!confirmDup) return;
  }
  
  const result = CartService.addVariant(product, variant);
  
  if (result?.success) {
    Toast.show(`${product.name} added to cart`);
    animateCartIcon();
    showMiniCart();
  }
};     

     
miniCartOpenBtn?.addEventListener("click", () => {
  hideMiniCart();
  renderCartView(); // your existing modal function
});
document.addEventListener("click", (e) => {
  if (!miniCart) return;

const clickedInside =
  miniCart.contains(e.target) ||
  document.getElementById("open-cart")?.contains(e.target) ||
  e.target.closest(".modal-add-to-cart") ||
  e.target.closest(".add-product-from-slide");

  if (!clickedInside) {
    hideMiniCart();
  }
});
      const modalTitle = document.getElementById("modal-title");

      const openCartBtn = document.getElementById("open-cart");
      if(openCartBtn){
      openCartBtn.addEventListener("click",() => {
        hideMiniCart();
        renderCartView();
      });
    };
    // Modal action buttons container
      const modalActions = document.querySelector('.modal-actions');
      
      const clrCart = document.createElement('button');
      clrCart.className = 'clear-cart-btn';
      clrCart.innerHTML = `Clear Cart`;
      
      const orderNowBtn = document.createElement('button');
      orderNowBtn.className = 'order-now-btn';
      orderNowBtn.innerHTML = `Order Now`;

      const cartModalActionBtnContainer = document.createElement("div");
      cartModalActionBtnContainer.className = 'cart-modal-action-btn-container';
      
      
      // innital Cart Item Renderer, used for both mini-cart and modal cart to avoid code duplication
      function buildCartItems(container) {
        const items = Cart.getItems();
      
        container.innerHTML = "";
        if (items.length === 0) {
          container.textContent = "Your cart is empty";
          return;
        }
      
        items.forEach(item => {
          const row = document.createElement("div");
          row.className = "cart-item";
      
          const label = document.createElement("span");
          label.textContent = `${item.name} (${item.variant || ""}) x ${item.quantity}`;
          
          const price = document.createElement("span");
          price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
      
          const btn = document.createElement("button");
          btn.textContent = "Remove";
          btn.dataset.id = item.id;
          btn.className = "remove-item";
      
          row.append(label, price, btn);
          container.appendChild(row);
        });
      }


      //Cart view in MODAL
      function renderCartView(){
        //const items = Cart.getItems(); EXIT!
        
        if (!modalContainer || !modalActions || !modalTitle) {
          console.warn("Cart modal elements missing on this page");
          return;
        }
        modalTitle.textContent = "Your Cart"
        modalActions.innerHTML = "";

        buildCartItems(modalContainer);
        cartModalActionBtnContainer.append(clrCart, orderNowBtn);
        modalActions.appendChild(cartModalActionBtnContainer);
       // updateCartTotals();
        openModal();
  } 

  


  function showMiniCart() {
  if (!miniCart || !miniCartItems) return;

  // reuse your extracted renderer
  buildCartItems(miniCartItems);

  miniCart.classList.remove("hidden");
  void miniCart.offsetWidth;
  requestAnimationFrame(() => {
    miniCart.classList.add("show");
  });
  //Timer that sets timeout for mini-cart pop up @add
  clearTimeout(miniCartTimeout);
  miniCartTimeout = setTimeout(hideMiniCart, 8000);
}

function hideMiniCart() {
  if (!miniCart) return;
  miniCart.classList.remove("show");
  setTimeout(() => {
    miniCart.classList.add("hidden");
  }, 200);
}


//incrementCounter for cartIcon,AnimatesOnAdd

function updateCartBadge() {
  let lastCount = 0;
  const badge = document.getElementById("cart-count");
  if (!badge) 
    return;
  const { count } = Cart.totals();
//OnlyShows when not Zero
  if (count === 0) {
    badge.style.display = "none";
    lastCount = 0;
    return;
  }
  badge.style.display = "inline-block";
  badge.textContent = count;

  //Bump Animation when Item is added
  if (count > lastCount) {
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  }
  lastCount = count;
}

  Cart.subscribe(() => {
    updateCartBadge();
  })
  updateCartBadge();
  
  
  window.showProductModal = function(card) {
    modalContainer.innerHTML = "";
    modalActions.innerHTML = "";
    
    const id = card.dataset.id;
    const product = productMap.get(String(id));
    if (!product) return;
    modalTitle.textContent = product.name;
    
    const productModal = document.createElement("div");
    productModal.className = "product-modal-content";
    
    // === Main Image ===
    const images = product.images || [];
    

    const modalState = {
      currentIndex:0,
      activeImages: images,
      selectedVariant: product.variants?.[0] || {
        id: product.id,
        size: product.size,
        price: product.price
      }  
    };  
    
    //image wrapper
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "modal-image-wrapper";
    
    const imageTrack = document.createElement("div");
    imageTrack.className = "modal-image-track";
    imageWrapper.appendChild(imageTrack);
    
    
    // === Thumbnail Container ===
    const thumbContainer = document.createElement("div");
    thumbContainer.className = "modal-thumbnails";
    
    // === Description ===
    const modalDesc = document.createElement("p");
    modalDesc.id = "modal-product-description";
    modalDesc.textContent =
    product.images?.[0]?.description || product.description;
    
    
    const priceDisplay = document.createElement("p");
    priceDisplay.className = "modal-price";
    priceDisplay.textContent = `$${modalState.selectedVariant?.price?.toFixed(2)}`;
    
    const variantContainer = document.createElement("div");
    variantContainer.className = "modal-variants";
    
    
    if (product.variants && product.variants.length > 1) {
      
    
    
    const label = document.createElement("p");
    label.textContent = "Select Size:";
    variantContainer.appendChild(label);
    
    product.variants.forEach(variant => {
    const variantBtn = document.createElement("button");
    variantBtn.textContent = variant.size;
    variantBtn.className = "variant-btn";
    
    if (variant === modalState.selectedVariant) {
      variantBtn.classList.add("active");
    }
    
    variantBtn.addEventListener("click", () => {
      modalState.selectedVariant = variant;
    
      // Update active state
      variantContainer.querySelectorAll(".variant-btn")
      .forEach(b => b.classList.remove("active"));
      variantBtn.classList.add("active");
      
      // Update price display
      priceDisplay.textContent = `$${variant.price.toFixed(2)}`;
      carousel.renderImagesForVariant();
    });
    
    variantContainer.appendChild(variantBtn);
  });
}
function createImageCarousel(){


  function next() {
    modalStatte.currentIndex = (modalState.currentIndex + 1) 
    % modalState.activeImages.length;

    updateImage(modalState.currentIndex);
  }
  function previous() {
    modalState.currentIndex = 
    (modalState.currentIndex - 1 + modalState.activeImages.length) 
    % modalState.activeImages.length;
    
  updateImage(modalState.currentIndex);
  }

  function goTo(index){
    modalState.currentIndex = index;

    updateImage(modalState.currentIndex);
  }
  return {
    updateImage,
    renderImagesForVariant,
    next,
    previous,
    goTo
  };
  
  function updateImage(index) {
    const offset = index * -100;
    imageTrack.style.transform = `translateX(${offset}%)`;
    
    const img = modalState.activeImages[index];
    if (!img)
      return;  
    
    modalDesc.textContent =
    img.description || product.description;
  };
  
   function renderImagesForVariant() {
    thumbContainer.innerHTML = "";
      
      const variantSpecific = product.images?.filter(
        img => String(img.variantId) === String(modalState.selectedVariant.id)
      ) || []  
      
      const imagesForVariant = variantSpecific.length > 0
      ? variantSpecific
      : product.images?.filter(img => !img.variantId) || [];
      
      modalState.activeImages = imagesForVariant;
      modalState.currentIndex = 0;
      
      if (imagesForVariant.length === 0) return;
    
      // Set main image to first matching image
      
      imageTrack.innerHTML = "";
      
      imagesForVariant.forEach(imgObj => {
        const img = document.createElement("img");
        img.src = imgObj.url;
        img.alt = imgObj.alt;
        img.className = "modal-track-image";
        
        imageTrack.appendChild(img);
      });    
      updateImage(0);

      modalDesc.textContent = 
      imagesForVariant[0].description || product.description;
      
      imagesForVariant.forEach((imgObj, index) => {
      const thumb = document.createElement("img");  
      
      thumb.src = imgObj.url;       
      thumb.alt = imgObj.alt;          
      thumb.className = "modal-thumb";
      
      thumb.addEventListener("click", () => {
       goTo(index);
      });  
      
      thumbContainer.appendChild(thumb);
    });
  }  

  
  return {
    updateImage,
    renderImagesForVariant
  };  
}       
  const carousel = createImageCarousel();

  carousel.renderImagesForVariant();

  setupSwipeHandlers(imageWrapper);
  
/*

  this is the function that controls the ability
  to swipe through the variants in the modal,
  not the carousel that displays the products
  */   
 function handleSwipe(direction) {
   if (direction === "left") {
     carousel.next();
    } else if (direction === "right") {
      carousel.previous();
    }      
  }    
  

  function setupSwipeHandlers(wrapper){
    
    let touchStartX = 0;
    let isSwiping = false;
    let touchEndX = 0;
    
    wrapper.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = false;
    });      
    
    wrapper.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      // minimum distance to count as swipe
      if (Math.abs(swipeDistance) < 40) 
        return;      
      if (swipeDistance < 0) {
      //  swipe left → next image      
     handleSwipe("left");   
    } else {
      //  swipe right → previous image    
      handleSwipe("right");  
    }  
    
  });      
  
  wrapper.addEventListener("touchmove", (e) => {
    const moveX = e.changedTouches[0].screenX;
    const deltaX = Math.abs(touchStartX - moveX);
      
      if (deltaX > 10) {
        isSwiping = true;
      }      
      
      if (isSwiping && e.cancelable) {
        e.preventDefault();
      }      
    }, { passive: false });      
    
  };         
 

    
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add To Cart";
  addBtn.className = "modal-add-to-cart";
  
  addBtn.addEventListener("click", () => {
  
  handleAddToCart(product, modalState.selectedVariant);
  
  });
   

  const cartPriceContainer = document.createElement("div");
  cartPriceContainer.className = "cart-price-container"
  
  cartPriceContainer.append(addBtn,priceDisplay)
  
  productModal.append(imageWrapper, variantContainer, cartPriceContainer, thumbContainer, modalDesc );
  modalContainer.append(productModal);




console.log("Products", product)
openModal();

setupSwipeHandlers(imageWrapper);
}  
const modal = document.getElementById("modal");

   

// Clear Cart Button 
  if (clrCart) {
    clrCart.addEventListener('click', () => {
      const confirmClear = confirm(`Are you sure you would like to Clear your entire cart?
      `);
      
      if (confirmClear)

      Cart.clear();
      //renderCartView(); EXIT!
      closeModal();
    });
  }
  

  
if (orderNowBtn) {
  orderNowBtn.addEventListener("click", processOrder);
}

function processOrder() {
  //  Get cart data from sessionStorage


  //const items = Object.values(Cart);
  const items = Cart.getItems();

  if (Cart.getItems().length === 0) {
    alert("Your cart is empty. you must add some items before ordering.");
    return;
  }

  const confirmOrder = confirm("Are you sure you want to place your order?");
  if (!confirmOrder) return;

  //  Example: create an order summary
  const orderSummary = items.map(item =>
    `${item.name} x ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
  ).join("\n");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  
  alert(`Your order has been placed!\n\n${orderSummary}\n\nTotal: $${total.toFixed(2)}`);

  // Clear cart after ordering
Cart.clear()
  renderCartView(); // refresh cart display
  closeModal();
}



document.addEventListener("click", (e) => {

const btn = e.target.closest(".remove-item");
if(!btn) return;

handleRemoveItem(btn);
});

function handleRemoveItem(button) {

  Cart.remove(button.dataset.id);
  renderCartView();
  
  
};

setupCartModal();
let lastFocusedElement = null;

// === MODAL LOGIC ===
function setupCartModal() {
  const closeModalBtn = document.getElementById("close-modal");
  const cartStatus = document.getElementById("cart-status");
  
    if (!modal || !openCartBtn || !closeModalBtn) {
      console.error("Modal elements not found in DOM");
      return;
    }

   // openCartBtn.addEventListener("click", () => openModal(modalViewWindow));
    closeModalBtn.addEventListener("click", () => closeModal(modal));

    // Close modal 
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal, openCartBtn, cartStatus);
    });

   
    trapFocus(modal);
  }
  
  function openModal() {
    
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    let modalOpen = true;
    
    const title = modal.querySelector("#modal-title");
    if (title) title.focus();
    console.log("Modal Open")
    
   //makeAnnouncement("Modal View Open, click anywhere outside the window, or press escape to close")
    
  }


function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    let modalOpen = false;
    console.log('Modal closed class=hidden')
    
    //makeAnnouncement("Modal view has been closed.")
    
    if (lastFocusedElement) lastFocusedElement.focus();
    
  }
  
 // accessibility Announcement
  
  function makeAnnouncement(message) {
   //const modal = document.getElementById("modal");
  
    if (modalViewWindow.hasClass("show")) {
      
      const region = document.getElementById("modal-status-region");
      if (region) {
        region.textContent = ""; // clear to force re-read
        setTimeout(() => {
          region.textContent = message;
        }, 400);
      }
    } else {
      
      const region = document.getElementById("status-region");
      if (region) {
        region.textContent = ""; // clear to force re-read
        setTimeout(() => {
          region.textContent = message;
        }, 400);
      }
    }
  }
  
  //accessibility focus trap
  function trapFocus(modal) {
    const focusableSelectors = `
    button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])
    `;
    const focusableEls = modal.querySelectorAll(focusableSelectors);
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    
    modal.addEventListener('keydown', (e) => {
      
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
      if (e.key === 'Escape') closeModal(modal, document.getElementById("open-cart"), document.getElementById("status-region"));
    });
  }
  
  



});