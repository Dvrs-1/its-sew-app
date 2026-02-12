

//find items in cart IF

var cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];


// link to rel for common styles
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/static/css/main.css?v=2026-02-12'; 

document.head.appendChild(link)





document.addEventListener('DOMContentLoaded', function() {



  

      
      //appending the hamburger item(id=newHamburger)

      const menuToggle = document.getElementById('hamburger-icon')
 
  
      if (menuToggle) {
        const hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'show-navigation-btn';
      
        const iconImage = document.createElement('i');
        iconImage.className = '<i class="fa-sharp-duotone fa-solid fa-bars fa-2xl"></i>';
        
        hamburgerButton.appendChild(iconImage);
        menuToggle.appendChild(hamburgerButton);
        hamburgerButton.id = "newHamburger"
      }
      
      
      
      //Hamburger Menu event Toggling
   
      const menuButton = document.getElementById('newHamburger');
      const mainMenu = document.querySelector('navigation-menu');
      
      $("#newHamburger").click(function(event) {
        event.preventDefault(); 
        const $menu = $(".navigation-menu");
      
        $menu.toggleClass("show hidden");
        if ($menu.hasClass("show")) {
          console.log("Menu is now visible");
         // makeAnouncement('Navigation menu open')
      
          $("#newHamburger").attr("aria-expanded", "true");
          toggleAriaExpanded(menuButton, mainMenu)
     
        } else {
          console.log("Menu is now hidden");//check console
         // makeAnouncement('Navigation menu closed')
    
        }
      });


  // footer Subscrib Feature Validation and Lstorage submission()
    
    const footerSubscribe = document.querySelector('.footer-subscribe');
    const emailInput = document.getElementById("emailToSubscribe");

    if (footerSubscribe) {
      footerSubscribe.addEventListener('submit', function(event) {
        event.preventDefault();

        let rawEmail = emailInput.value.trim();

        // Basic validation if empty
        if (rawEmail === "") {
          alert('Please enter an email to subscribe with!');
          emailInput.focus();
          return;
        }

        // Pattern validation for email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(rawEmail)) {
          alert('Please enter a valid email address!');
          emailInput.focus();
          return;
        }

        // Sanitization
        const sanitizedEmail = rawEmail.replace(/<[^>]*>/g, "");

        // Store sanitized email in local storage
        const subscribedEmail = { email: sanitizedEmail };
        sessionStorage.setItem("subscribedEmail", JSON.stringify(subscribedEmail));

        alert(`Subscription saved for: ${sanitizedEmail}`);
        emailInput.value = "";
      });
    }
    






 function toggleAriaExpanded(button, target) {
     if (!button || !target) return;

  const expanded = button.getAttribute("aria-expanded") === "true";
  const next = !expanded;

  button.setAttribute("aria-expanded", String(next));
  target.hidden = !next;

  return next;

    }

 function moveFocusInto(container) {
  if (!container) return;

  const focusable = container.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusable?.focus();
}

 function returnFocusTo(el) {
  el?.focus();
}

    
    


  
  
 function announce(message, regionId = "status-region") {
  const region = document.getElementById(regionId);
  if (!region) return;

  region.textContent = "";      // clear
  requestAnimationFrame(() => { // let DOM settle
    region.textContent = message;
  });
}




 function enableCarouselKeyboard(carousel) {
  if (!carousel) return;

  carousel.setAttribute("tabindex", "0");
  carousel.setAttribute("role", "region");
  carousel.setAttribute("aria-roledescription", "carousel");

  carousel.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    e.preventDefault();

    const delta = e.key === "ArrowRight" ? 1 : -1;
    carousel.dispatchEvent(
      new CustomEvent("carousel:step", { detail: delta })
    );
  });
}

    });







  