
import { auth,db} from "../js/firebase-config.js";

import { doc, setDoc } from "firebase/firestore";

import { sendEmailVerification, sendPasswordResetEmail ,createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const signupForm=document.getElementById('signupForm');
const loginForm=document.getElementById('loginForm');
const logoutBtn=document.getElementById('logout');
const forgotForm = document.getElementById('forgot');
const forgotEmail = document.getElementById('forgotEmail');
// const errorMessage = document.getElementById('error-message'); 
// const successMessage = document.getElementById('success-message'); 

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    return password.length >= 6; 
  }


  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
  
      const email = signupForm['email'].value;
      const password = signupForm['password'].value;
      const confirmPassword = signupForm['confirmPassword'].value;
      const privacyCheckbox = document.getElementById('privacyCheckbox');
  
      // Clear previous messages
      document.getElementById('error-message').textContent = '';
      document.getElementById('success-message').textContent = '';
  
      // Check if Privacy Policy is accepted
      if (!privacyCheckbox.checked) {
        document.getElementById('error-message').textContent = `❗ Please agree to the Privacy Policy.`;
        return;
      }
  
      if (!validateEmail(email)) {
        document.getElementById('error-message').textContent = `Please enter a valid email.`;
        return;
      }
  
      if (!validatePassword(password)) {
        document.getElementById('error-message').textContent = `Password should be of length 6 or more.`;
        return;
      }
  
      if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = `Passwords do not match.`;
        return;
      }
  
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // After signup, create user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email  
        });
  
        document.getElementById('success-message').textContent = `✅ Please verify your email. Verification Email Sent`;
        document.getElementById('success-message').style.color = "green";
        document.getElementById('success-message').style.fontWeight = "bolder";
        
        sendEmailVerification(user);
  
      } catch (error) {
        document.getElementById('error-message').textContent = "❌ Email Already Exist";
      }
    });
  }
  

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = loginForm['email'].value;
      const password = loginForm['password'].value;

      // Validate email and password
      if (!validateEmail(email)) {
          document.getElementById('error-message').textContent = `Invalid Email`;
          return;
      }

      if (!validatePassword(password)) {
          document.getElementById('error-message').textContent = `Invalid Password`;
          return;
      }

      // Sign in user
      signInWithEmailAndPassword(auth, email, password)
          .then((cred) => {
              const user = cred.user;
              
              if (user.emailVerified) {
                  console.log('Logged In:', user);

                  // OPTIONAL: Save user UID in localStorage/sessionStorage if you want to use it later
                  localStorage.setItem('userUID', user.uid);

                  // Redirect to dashboard
                  window.location.href = "../pages/dashboard.html";
              } else {
                  document.getElementById('error-message').textContent = `Please verify your email first. Check your inbox.`;
                  auth.signOut(); // Sign out unverified users
              }
          })
          .catch((error) => {
              console.error(error);
              document.getElementById('error-message').textContent = `Please enter valid credentials !!!`;
          });
  });
}





// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();

      auth.signOut()
          .then(() => {
              // Clear any user-specific storage if you are using it
              localStorage.removeItem('userUID');

              // Redirect to login page
              window.location.href = '../pages/login.html';
          })
          .catch((error) => {
              console.error('Error signing out:', error);
          });
  });
}

// FORGOT PASSWORD 
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
   
      e.preventDefault();

      // Clear previous messages
      message1.textContent = '';
      message2.textContent = '';

      const email = forgotEmail.value.trim(); // .trim() to remove accidental spaces

   

      if (!validateEmail(email)) {
          message2.textContent = 'Please enter a valid email address.';
          message2.style.color = 'red';
          return;
      }

      else{
        console.log("Sending reset email");
        sendPasswordResetEmail(auth, email)
          .then(() => {
            
              message1.textContent = 'Password reset email sent! Check your inbox.';
              message1.style.color = 'green';
              forgotForm.reset();
          })
          .catch((error) => {
              

              if (error.code === 'auth/user-not-found') {
                  message2.textContent = 'No account found with this email.';
              } else if (error.code === 'auth/invalid-email') {
                  message2.textContent = 'Invalid email address.';
              } else {
                  message2.textContent = 'Something went wrong. Please try again.';
              }
              message2.style.color = 'red';
          });

      }

      
  });
}



function clearMessage() {
  document.getElementById('error-message').textContent = '';
  //document.getElementById('forgotMessage').textContent = '';
}


document.addEventListener('click', function (event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' ) {
      clearMessage();
  }
});