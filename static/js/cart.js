

const listeners = new Set();

const subscribers = new Set();

function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify(event) {
  subscribers.forEach(fn => fn(event));
}

const Cart = (() => {
  let items = loadCartFromStorage();

  function loadCartFromStorage() {
    let raw;
    try {
      raw = JSON.parse(sessionStorage.getItem("cartItems"));
    } catch {
      return {};
    }
    if (!raw || typeof raw !== "object") return {};

    const normalized = {};
    for (const [id, item] of Object.entries(raw)) {
      if (
        typeof id === "string" &&
        item &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
      ) {
        normalized[id] = {
          id,
          name: item.name,
          price: item.price,
          quantity: Math.floor(item.quantity)
        };
      }
    }
    return normalized;
  }
  
  
  function save() {
    sessionStorage.setItem("cartItems", JSON.stringify(items));
  }
  
 

  function getItems() {
    return Object.values(items);
  }

  function isEmpty() {

    return Object.keys(items).length === 0;
  }


  function add(product) {
    if (!product || !product.id) return;
  
    const id = String(product.id);
    const existed = Boolean(items[id]);

    if (items[id]) {
      items[id].quantity++;
    } else {
      items[id] = {
        id,
        name: product.name,
        price: product.price,
        quantity: 1
      };
    }
  
    save();
    notify({
    type: "add",
    id,
    quantity: items[id].quantity,
    existed
  });
  }

  function remove(id) {
    id = String(id);
    if (!items[id]) return;
  
    if (items[id].quantity > 1) {
      items[id].quantity--;
      save();
  
      notify({
        type: "remove",
        id,
        quantity: items[id].quantity,
        removedCompletely: false
      });
    } else {
      delete items[id];
      save();
  
      notify({
        type: "remove",
        id,
        quantity: 0,
        removedCompletely: true
      });
    }
  }

  function clear() {
    items = {};
    save();
    notify({
      type: "clear"
    });
  }

  function totals() {
    const items = getItems();
    return {
      count: items.reduce((s, i) => s + i.quantity, 0),
      price: items.reduce((s, i) => s + i.price * i.quantity, 0)
    };
  }



 

  return {
    getItems,
    isEmpty,
    add,
    remove,
    clear,
    totals,
    subscribe
  };
})();