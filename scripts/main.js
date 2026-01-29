

//find items in cart IF

var cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];


// link to rel for common styles
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'css/main.css'; 

document.head.appendChild(link)



document.addEventListener('DOMContentLoaded', function() {



  $( ".justA" ).attr( "href", "aboutus.html" );

      
      //appending the hamburger item(id=newHamburger)

      const menuToggle = document.querySelector('.hamburger-icon')
 
  
      if (menuToggle) {
        const hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'show-navigation-btn';
      
        const iconImage = document.createElement('i');
        iconImage.className = 'fa-solid fa-bars fa-2xl';
        
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
          makeAnouncement('Navigation menu open')
      
          $("#newHamburger").attr("aria-expanded", "true");
          toggleAriaExpanded(menuButton, mainMenu)
     
        } else {
          console.log("Menu is now hidden");//check console
         makeAnouncement('Navigation menu closed')
    
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
        localStorage.setItem("subscribedEmail", JSON.stringify(subscribedEmail));

        alert(`Subscription saved for: ${sanitizedEmail}`);
        emailInput.value = "";
      });
    }
    






    function toggleAriaExpanded(triggerBtn, targetElement, focusTrappedEl) {
      if (!triggerBtn || !targetElement) return;
    
      const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
    
      triggerBtn.setAttribute('aria-expanded', String(newState));
      triggerBtn.setAttribute('aria-label', newState ? closeMsg : openMsg);
      targetEl.hidden = !newState; // Make sure it's hidden when not expanded
    
      // Delay announcement just enough to let screen reader catch up(refrenced to by MDN Docs)
     
      if (newState && typeof focusTrappedEl === 'function') {
        focusTrappedEl(targetElement);
        const firstFocusable = targetElement.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
      } else if (!newState) {
        triggerBtn.focus();
      }
    }

    
    


  
  
    
    
    
    
  function makeAnouncement(message, regionId = "status-region") {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = ""; //forced reading 
      setTimeout(() => {
        region.textContent = message;
      }, 400);
    }
  }



    });







  