
document.addEventListener('DOMContentLoaded', function() {
  

  cleanupExpiredStorage();
  const form = document.getElementById('custom-order-form');
  const resultDiv = document.getElementById('result');


  
  form.addEventListener('submit', function (e) {
  e.preventDefault();

  const rawName = document.getElementById("name").value.trim();
  const rawPhone = document.getElementById("phone").value;
  const rawEmail = document.getElementById("email").value.trim();
  const rawFeedback = document.getElementById("feedback").value.trim();
  const customOrder = document.getElementById("custom-order").checked;

  if (!rawName || !rawEmail) {
    alert('Please fill in both name and email fields.');
    return;
  }

  const customerInfo = {
    name: DOMPurify.sanitize(rawName),
    phone: DOMPurify.sanitize(rawPhone),
    email: DOMPurify.sanitize(rawEmail),
    feedback: DOMPurify.sanitize(rawFeedback),
    customOrder: customOrder
  };

  resultDiv.textContent = "Submitting…";

  fetch("/api/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customerInfo)
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Server error");
      }
      return res.json();
    })
    .then(data => {
      if (data.status !== "success") {
        throw new Error("Submission failed");
      }

      // ✅ Server confirmed success — NOW we proceed
      const keyValue = `user_${customerInfo.name}_${Date.now()}`;
      setTimedStorage(keyValue, customerInfo, 5000);

      displaySubmissionResult(customerInfo);
      resultDiv.textContent = "";
    })
    .catch(err => {
      console.error(err);
      resultDiv.textContent = "Submission failed. Please try again.";
    });
});

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
              <a href="/aboutus" style="color: #155724; text-decoration: underline;">Back to page</a>
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
