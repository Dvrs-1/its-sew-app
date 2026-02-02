
document.addEventListener('DOMContentLoaded', function() {
  

  cleanupExpiredStorage();
  const form = document.querySelector('form[action="process.php"]');
  const resultDiv = document.getElementById('result');


  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); 
      
      // Get form data
            const rawName = document.getElementById("name").value.trim();
            const rawPhone = document.getElementById("phone").value;
            const rawEmail = document.getElementById("email").value.trim();
            const rawFeedback = document.getElementById("feedback").value.trim();
            const customOrder = document.getElementById("custom-order").checked;
           

            if (!rawName || !rawEmail) {
              alert('Please fill in both name and email fields.');
              return;
            }

            const name = DOMPurify.sanitize(rawName);
            const phone = DOMPurify.sanitize(rawPhone);
            const email = DOMPurify.sanitize(rawEmail);
            const feedback = DOMPurify.sanitize(rawFeedback);


            const customerInfo = {
              name: name,
              phone: phone,
              email: email,
              feedback: feedback,
              customOrder: customOrder
            };


            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'process.php', true);
            xhr.responseType = 'json'
            xhr.timeout = 5000;
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4 && xhr.status === 200) {
                resultDiv.textContent = xhr.response;
              }
            };
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(customerInfo));
        

        
            xhr.ontimeout = function() {
              resultDiv.textContent = "The server took too long to respond. Please try again.";
            
            };
            
            //  Network failure
            xhr.onerror = function() {
              resultDiv.textContent = "Network error. Check your connection and retry.";
            };


      //customer Objects for Local Storage

            const keyValue = `user_${name}_${new Date()}`;

            /*
            sessionStorage.setItem(keyValue, JSON.stringify(customerInfo));
            */

            //setting time limit for submitted customer information to be stored in locat storage
            setTimedStorage(keyValue, customerInfo, 5000)//ms value
      
              //access and parse local data back out of localStorage in order to USE
              const who = JSON.parse( localStorage.getItem(keyValue) );
              if(who){
            
            displaySubmissionResult(who);
          }else{console.warn('no user data in Local storage');}

          });
        }

        // *** setting timed storage for localStorage of user information
function setTimedStorage(keyValue, value, duration, onExpire){
localStorage.setItem(keyValue,JSON.stringify(value));

const expireTime = Date.now() + duration;
localStorage.setItem(`${keyValue}_expire`, expireTime);


setTimeout(() => {

  const now = Date.now();
  const storedExpire = localStorage.getItem(`${keyValue}_expire`);

  if(storedExpire && now >= storedExpire){
    localStorage.removeItem(keyValue);
    localStorage.removeItem(`${keyValue}_expire`);

  }


},duration);

}

function cleanupExpiredStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.endsWith('_expire')) {
      const baseKey = key.replace('_expire', '');
      const expireTime = localStorage.getItem(key);
      if (Date.now() >= expireTime) {
        localStorage.removeItem(baseKey);
        localStorage.removeItem(key);
      }
    }
  }
}



        function displaySubmissionResult(who) {
          const displayedUserSubmission = document.getElementById('session-storage-submission');
        
         
          const existingResult = document.getElementById('submission-result');
          if (existingResult) {
            existingResult.remove();
          }
        
          const resultDiv = document.createElement('div');
          resultDiv.id = 'submission-result';
          resultDiv.className = 'submission-result';
          resultDiv.style.cssText = `
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-family: Arial, sans-serif;
          `;
        
          resultDiv.innerHTML = `
              <h3>Form Submitted Successfully!</h3>
              <p><strong>Name:</strong> ${who.name}</p>
              <p><strong>Email:</strong> ${who.email}</p>
              <p>Thank you for your message!</p>
              <a href="aboutus.html" style="color: #155724; text-decoration: underline;">Back to page</a>
          `;
        
          displayedUserSubmission.appendChild(resultDiv);
        
          resultDiv.scrollIntoView({ behavior: 'smooth' });
        
        }
 

//clearing  localStorage submission with clear form button

const clearStorage = document.getElementById("clear-form");
clearStorage.addEventListener('click',clearLocalStorage);

function clearLocalStorage(){

  localStorage.removeItem('keyValue')
  localStorage.removeItem('subscribedEmail')
  localStorage.removeItem('user')
  localStorage.removeItem('cartItems')

}


      
    });
