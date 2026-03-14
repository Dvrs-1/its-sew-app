

//find items in cart IF

var cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];


// link to rel for common styles
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/static/css/main.css?v=2026-03-07'; 

document.head.appendChild(link)





document.addEventListener('DOMContentLoaded', function() {



  // Hero group navigation elements

      
      //Hamburger icon

      const menuToggle = document.getElementById('hamburger-icon')

  
      if (menuToggle) {
       
       console.log('menutoggle')
      }
        const hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'show-navigation-btn navigation-hero';
      
        const iconImage = document.createElement('i');
        iconImage.innerHTML = `<i class="fa-sharp-duotone fa-solid fa-bars fa-2xl"></i>`;
     

        hamburgerButton.appendChild(iconImage);
       // menuToggle.appendChild(hamburgerButton);
        hamburgerButton.id = "newHamburger"
       
      
      
      //Hamburger Menu event Toggling
      
      const mainMenu = document.querySelector('.navigation-menu');
      
      hamburgerButton.addEventListener('click', function(event) {
        event.preventDefault(); 
       
      
    
        if (hamburgerButton) {
          mainMenu.classList.toggle("show");
          mainMenu.classList.toggle("hidden");
          console.log("Menu is now visible");
         // makeAnouncement('Navigation menu open')
      
         hamburgerButton.setAttribute("aria-expanded", "true");
          toggleAriaExpanded(hamburgerButton, mainMenu)
     
        } else {
          console.log("Menu is now hidden");//check console
         // makeAnouncement('Navigation menu closed')
    
        }
      });

      

      const heroGroupContainer = document.querySelector('.hero-group-container');

      if(heroGroupContainer){
      const heroGroupNav = document.createElement('div');
      heroGroupNav.className = "hero-group-navigation";

      const homeButton = document.createElement('a');
      homeButton.href = '/';
      homeButton.innerHTML = `<i class="fa-solid fa-house"></i><span>Home</span>`;
      const galleryLink = document.createElement('a');
      galleryLink.href = '/gallery';
      galleryLink.innerText = 'Gallery';
      const aboutUsLink = document.createElement('a');
      aboutUsLink.href = '/aboutus';
      aboutUsLink.innerText = "About Us"

      heroGroupNav.append(homeButton,galleryLink,aboutUsLink,hamburgerButton);

      heroGroupContainer.appendChild(heroGroupNav);

      };



  //Footer Hours Table

      const footer = document.querySelector('.footer');
      footerContainer = document.createElement('div');
      footerContainer.className = "footer-container"

      const footerHours = document.createElement('section')
      const hoursTable = document.createElement('table');
      hoursTable.id = "hours-table";
      hoursTable.innerHTML =`
       <table id="hours-table">
         <tr><th colspan="3">Hours of Operation</th></tr>
         <tr>
         <th>Days</th><th>Open</th><th>Close</th>
         </tr>
         <tr><td>Mon-Friday</td><td>9 a.m</td><td>6 p.m</td>
         </tr>
         <tr>
         <td>Sat-Sun</td><td>10 a.m</td><td>5 p.m</td>
         </tr>
       </table>
      `

      footerHours.appendChild(hoursTable);


//footer social links
const socialLinks = document.createElement('nav');
socialLinks.id = 'social-links';
socialLinks.ariaLabel = "Social media";

const footerSocial = document.createElement('section')

const platforms = [
  { href: 'https://facebook.com/yourpage', icon: 'facebook.svg', label: 'Follow us on Facebook' },
  { href: 'https://linkedin.com/in/yourpage', icon: 'linkedin.svg', label: 'Connect with us on LinkedIn' },
  { href: 'https://pinterest.com/yourpage', icon: 'pinterest.svg', label: 'View us on Pinterest' }
];

platforms.forEach(platform => {
  const link = document.createElement('a');
  link.href = platform.href;
  link.setAttribute('aria-label', platform.label);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.src = `/static/images/SVG/${platform.icon}`;
  img.alt = '';

  link.appendChild(img);
  socialLinks.appendChild(link);
});

footerSocial.appendChild(socialLinks);


const footerSubscribeForm = document.createElement('form');
footerSubscribeForm.className = 'footer-subscribe';
footerSubscribeForm.action = "";

const emailToSubscribe = document.createElement('input');
emailToSubscribe.type = 'email';
emailToSubscribe.id = 'emailToSubscribe';
emailToSubscribe.autocomplete = 'off';

const subscribeBtn = document.createElement('input');
subscribeBtn.type = 'submit';
subscribeBtn.name = 'submit';



footerSubscribeForm.append(emailToSubscribe, subscribeBtn);
if(footer){
  const div = document.createElement('div');
  div.append(footerSubscribeForm, footerSocial);
  footerContainer.append(footerHours, div);
  footer.appendChild(footerContainer);

}

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







  