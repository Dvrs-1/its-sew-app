const CartService = (() => {

  function isInCart(id) {
    return Cart.getItems().some(item => item.id === String(id));
  }

  function add(product) {
    if (!product || !product.id) return;

    const existed = isInCart(product.id);

    Cart.add(product);

    return {
      success: true,
      existed,
      product
    };
  }

  function addVariant(product, variant) {
    if (!variant) return { success: false };

    const formatted = {
        id: variant.id,
        productId: product.id,
        name: product.name,
        variant: variant.size,
        price: variant.price,
        categoryId: product.categoryId
    };

    return add(formatted);
  }

  return {
    add,
    addVariant
  };

})();