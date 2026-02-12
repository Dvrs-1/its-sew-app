document.addEventListener('DOMContentLoaded', () => {

  //  Load external cart stylesheet 
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = "/static/css/cartstyles.css?v=2026-02-12";
  document.head.appendChild(link);

  const modalContainer = document.getElementById("modal-view-container");
   
  // Storage helpers 


      const cartSummary = document.getElementById("cart-total");

      function updateCartTotals() {
        if (!cartSummary) return;
      
     
      
        if (Cart.isEmpty()) {
          cartSummary.textContent = "Empty $0.00";
          return;
        }
      
        const { count, price} = Cart.totals();
      
        cartSummary.innerHTML = `
          <p><strong>Items in Cart:</strong> ${count}</p>
          <p><strong>Total Price:</strong> $${price.toFixed(2)}</p>
        `;
       
      }

      Cart.subscribe(() => {
        updateCartTotals();
      });
      updateCartTotals()

     
      const modalTitle = document.getElementById("modal-title");

      const openCartBtn = document.getElementById("open-cart");
      if(openCartBtn){
      openCartBtn.addEventListener("click",renderCartView);
    };

      const modalActions = document.querySelector('.modal-actions');
      
      const clrCart = document.createElement('button');
      clrCart.className = 'clear-cart-btn';
      clrCart.innerHTML = `Clear Cart`;
      
      const orderNowBtn = document.createElement('button');
      orderNowBtn.className = 'order-now-btn';
      orderNowBtn.innerHTML = `Order Now`;

      const cartModalActionBtnContainer = document.createElement("div");
      cartModalActionBtnContainer.className = 'cart-modal-action-btn-container';
      

      function renderCartView(){
        const items = Cart.getItems();

        if (!modalContainer || !modalActions || !modalTitle) {
          console.warn("Cart modal elements missing on this page");
          return;
        }
        modalTitle.textContent = "Your Cart"
        modalContainer.innerHTML = "";
        modalActions.innerHTML = "";

        if (items.length === 0) {
          modalContainer.textContent = "Your cart is empty";
        openModal();
          return;
        }
        
        items.forEach(item => {
          const row = document.createElement("div");
          row.className = "cart-item";
      
          const label = document.createElement("span");
          label.textContent = `${item.name} x ${item.quantity}`;
      
          const price = document.createElement("span");
          price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
      
          const btn = document.createElement("button");
          btn.textContent = "Remove";
          btn.dataset.id = item.id;
          btn.className = "remove-item";
      
          row.append(label, price, btn);
          modalContainer.appendChild(row);
        });
        cartModalActionBtnContainer.append(clrCart, orderNowBtn);
        modalActions.appendChild(cartModalActionBtnContainer);
       // updateCartTotals();

        openModal();
       
  } 
 
  
  
  
  //Gallery+Card Button Event Delegation
  
  
  
  const galleryContainer =   document.getElementById("gallery-container")
  
  if(galleryContainer){
    
    galleryContainer.addEventListener("click", e => {

    //Expandable Text on cards
    if (e.target.classList.contains("show-more")) {

      const card = e.target.closest(".gallery");
      showProductModal(card);
      
      
    }

    function showProductModal(card) {
  modalContainer.innerHTML = "";
  modalActions.innerHTML = "";

  const id = card.dataset.id;
  const product = productMap.get(String(id));
  if (!product) return;

  modalTitle.textContent = product.name;

  const productModal = document.createElement("div");
  productModal.className = "product-modal-content";

  // === Main Image ===
  const mainImage = document.createElement("img");
  mainImage.id = "modal-product-image";
  mainImage.src = product.images?.[0]?.url || product.image;
  mainImage.alt = product.images?.[0]?.alt || product.alt;

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "modal-image-wrapper";
  imageWrapper.appendChild(mainImage);

  // === Description ===
  const modalDesc = document.createElement("p");
  modalDesc.id = "modal-product-description";
  modalDesc.textContent =
    product.images?.[0]?.description || product.description;

    
    // === Variant Selection ===
    let selectedVariant = product.variants?.[0] || {
  id: product.id,
  size: product.size,
  price: product.price
};
// === Thumbnail Container ===
const thumbContainer = document.createElement("div");
thumbContainer.className = "modal-thumbnails";

function renderImagesForVariant() {
  thumbContainer.innerHTML = "";

  const variantSpecific = product.images?.filter(
  img => img.variantId === selectedVariant.id
) || []

  const imagesForVariant = variantSpecific.length > 0
  ? variantSpecific
  : product.images?.filter(img => !img.variantId) || [];

  if (imagesForVariant.length === 0) return;

  // Set main image to first matching image
  mainImage.src = imagesForVariant[0].url;
  mainImage.alt = imagesForVariant[0].alt;
  modalDesc.textContent =
    imagesForVariant[0].description || product.description;

  imagesForVariant.forEach(imgObj => {
    const thumb = document.createElement("img");
    thumb.src = imgObj.url;
    thumb.alt = imgObj.alt;
    thumb.className = "modal-thumb";

    thumb.addEventListener("click", () => {
      mainImage.src = imgObj.url;
      mainImage.alt = imgObj.alt;
      modalDesc.textContent =
        imgObj.description || product.description;
    });

    thumbContainer.appendChild(thumb);
  });
}
renderImagesForVariant();



    const priceDisplay = document.createElement("p");
    priceDisplay.className = "modal-price";
    priceDisplay.textContent = `$${selectedVariant?.price?.toFixed(2)}`;

const variantContainer = document.createElement("div");
variantContainer.className = "modal-variants";

if (product.variants && product.variants.length > 1) {
  
  

  const label = document.createElement("p");
  label.textContent = "Select Size:";
  variantContainer.appendChild(label);

  product.variants.forEach(variant => {
    const btn = document.createElement("button");
    btn.textContent = variant.size;
    btn.className = "variant-btn";
    
    if (variant === selectedVariant) {
      btn.classList.add("active");
    }
    
    btn.addEventListener("click", () => {
      selectedVariant = variant;

      // Update active state
      variantContainer.querySelectorAll(".variant-btn")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update price display
      priceDisplay.textContent = `$${variant.price.toFixed(2)}`;
      renderImagesForVariant();
    });
    
    variantContainer.appendChild(btn);
  });
}

const addBtn = document.createElement("button");
addBtn.textContent = "Add To Cart";
addBtn.className = "modal-add-to-cart";

addBtn.addEventListener("click", () => {

    const confirmProduct = confirm(`Add one "${product.name}" cart?
      `);
      
      if (!confirmProduct) return

const alreadyInCart =
  Cart.getItems().some(item => item.id === selectedVariant.id);

if (alreadyInCart) {
  const confirmAdd = confirm(
    `There is already a "${product.name} - ${selectedVariant.size}" in your cart.\nAdd another?`
  );
  if (!confirmAdd) return;
}

Cart.add({
  id: selectedVariant.id,
  name: `${product.name} - ${selectedVariant.size}`,
  price: selectedVariant.price
});

  closeModal();
});

const cartPriceContainer = document.createElement("div");
cartPriceContainer.className = "cart-price-container"

cartPriceContainer.append(addBtn,priceDisplay)

  productModal.append(imageWrapper, variantContainer, cartPriceContainer, thumbContainer, modalDesc );
  modalContainer.append(productModal);

  openModal();
}


    
  //Gallery cards Add to cart button
  if (e.target.classList.contains("add-to-cart-btn")) {
    addToCartClick(e.target);
  }
})};

function addToCartClick(button) {
  const galleryItem = button.closest(".gallery");
  const id = galleryItem.dataset.id;
  const product = productMap.get(id);

  const alreadyInCart =
    Cart.getItems().some(item => item.id === String(id));

    const confirmProduct = confirm(`Add one "${product.name}" cart?
      `);
      
      if (!confirmProduct) return

  if (alreadyInCart) {
    const confirmAdd = confirm(
      `There is already a "${product.name}" in your cart.\nAdd another?`
    );
    if (!confirmAdd) return;
  }

  Cart.add(product);
 
}
 
  
  // Clear Cart Button 
  if (clrCart) {
    clrCart.addEventListener('click', () => {
      const confirmClear = confirm(`Are you sure you would like to Cleare your entire cart?
      `);
      
      if (confirmClear)

      Cart.clear();
      renderCartView();
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
  //sessionStorage.removeItem("cartItems");
  //cart = {}; 
  renderCartView(); // refresh cart display
  closeModal();
}



modalContainer.addEventListener("click", (e) => {

const btn = e.target.closest(".remove-item");
if(!btn) return;

handleRemoveItem(btn);
});

function handleRemoveItem(button) {

  Cart.remove(button.dataset.id);
  renderCartView();

 
};

  setupCartModal();

  // === MODAL LOGIC ===
  function setupCartModal() {
    const modalViewWindow = document.getElementById("modal");
    const closeModalBtn = document.getElementById("close-modal");
    const cartStatus = document.getElementById("cart-status");
    
    if (!modalViewWindow || !openCartBtn || !closeModalBtn) {
      console.error("Modal elements not found in DOM");
      return;
    }

   // openCartBtn.addEventListener("click", () => openModal(modalViewWindow));
    closeModalBtn.addEventListener("click", () => closeModal(modalViewWindow));

    // Close modal 
    modalViewWindow.addEventListener("click", (e) => {
      if (e.target === modalViewWindow) closeModal(modal, openCartBtn, cartStatus);
    });

   
    trapFocus(modalViewWindow);
  }
  
  function openModal() {
    
    lastFocusedElement = document.activeElement;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    
    
    const title = modal.querySelector("#modal-title");
    if (title) title.focus();
    console.log("Modal Open")
    
   //makeAnnouncement("Modal View Open, click anywhere outside the window, or press escape to close")
    
  }


function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
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

/* 
// starter package Logic

const addStarterPackage = document.querySelector('.add-starter-package');
if (addStarterPackage) {
    addStarterPackage.addEventListener('click', () => {
      const starterPackage = addStarterPackage.dataset.id;
      const gardenStarter = [
        { id: '438', name: 'Potting Soil', price: 5.37 },
    { id: '439', name: 'Watering Can', price: 17.99 },
    { id: '434', name: 'Aloe Plant', price: 13.78 }
  ];
  
  const starterPackageDeal = {
    id: starterPackage,
    name: 'Starter Package Deal',
    price: gardenStarter.reduce((sum, item) => sum + item.price, 0) * 0.9,
    isBundle: true,
    items: gardenStarter
  };
  
  addToCart(starterPackageDeal);
  alert('The Garden Starter Package has been added to the cart!');
  });
  }

  setupCartModal();


  //bundle cart button

      const bundleCartButton = document.querySelector('.add-bundle');
      if (bundleCartButton) {
        bundleCartButton.addEventListener('click', () => {
          const specialBundle = bundleCartButton.dataset.id;
          const bundledItems = [
            { id: '438', name: 'Potting Soil', price: 5.37 },
        { id: '439', name: 'Watering Can', price: 17.99 }
      ];
      
      const bundleSpecial = {
        id: specialBundle,
        name: 'Special Combo Deal',
        price: bundledItems.reduce((sum, item) => sum + item.price, 0) * 0.9,
        isBundle: true,
        items: bundledItems
      };
      
      addToCart(bundleSpecial);
      alert('Your combo deal has been added to the cart!');
    });
  }


        // === 5. Bundle Button Handler ===

  //  Add to cart 
  function addToCart(product) {
    if (cart[product.id]) {
      cart[product.id].quantity++;
    } else {
      cart[product.id] = { ...product, quantity: 1 };
    
    }
  
    renderCart();
    updateCartTotals();
  }

*/