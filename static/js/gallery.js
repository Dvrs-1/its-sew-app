 

 const productMap = new Map();


 const API_BASE = window.location.origin;  // dynamically grabs current host + protocol

fetch(`${window.location.origin}/api/products`)
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
  container.innerHTML = "";
 
  
  
  products.forEach(product => {

    const image = product.images ? product.images[0]?.url : product.image;
    const alt = product.images ? product.images[0]?.alt : product.alt;
    const price = product.variants ? product.variants[0]?.price : product.price;
    const description = product.description || "No description available.";

    const card = document.createElement("div");
    card.className = "gallery";
    card.dataset.id = product.id;

 card.innerHTML = `
  <figure class="product-media card">
    <img class="product-image" src="${image}" alt="${alt}">
  </figure>

  <figcaption class="product-name">${product.name}</figcaption>

  <p class="product-price">$${Number(price).toFixed(2)}</p>
  <button class="add-to-cart-btn" aria-label="Add ${product.name} to cart">Add To Cart</button>
  <button class="show-more">Show More</button>
  <p class="product-description">${description}</p>
`;
  
    container.appendChild(card);
  });
}


  

 

