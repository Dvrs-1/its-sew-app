
const Toast = (() => {
  let container;

  function init() {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  function show(message, duration = 2500) {
    if (!container) init();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    container.appendChild(toast);

    // trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

    return { show };

})();