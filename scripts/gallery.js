 

 const productMap = new Map();

 fetch("/data/products.json")
   .then(res => res.json())
   .then(products => {
     products.forEach(product => {
       productMap.set(String(product.id), product);
     });
 
     renderGallery(products);
   })
   .catch(err => {
     console.error("Failed to load products", err);
   });

 // gallery product cards

 function renderGallery(products) {
  const container = document.getElementById("gallery-container");

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "gallery";
    card.dataset.id = product.id;

    card.innerHTML = `
      <figure class="product-media">
        <figcaption>${product.name}</figcaption>
        <img src="${product.image}" alt="${product.alt}">
      </figure>

      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" aria-label="Add ${product.name} to cart">Add To Cart</button>
      <button class="show-more">Show More</button>
      <p class="product-description">${product.description}</p>
    `;
  
    container.appendChild(card);
  });
}


  

 

