// adminLogin.js
import { auth, db } from "../js/firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logout');
const errorMessage = document.getElementById('error-message');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const close = document.querySelector('.close');
    const navMenu = document.querySelector('.nav-menu');
    const authMenu = document.querySelector('.auth-menu');

    hamburger.addEventListener('click', function() {
        navMenu.classList.add('active');
        authMenu.classList.add('active');
        hamburger.classList.add('active');
        close.classList.add('active');
    });

    close.addEventListener('click', function() {
        navMenu.classList.remove('active');
        authMenu.classList.remove('active');
        hamburger.classList.remove('active');
        close.classList.remove('active');
    });
});

// ADMIN LOGIN FORM
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!validateEmail(email)) {
            errorMessage.innerText = "Please enter a valid email.";
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const adminRef = doc(db, "admins", user.uid);
            const adminSnap = await getDoc(adminRef);

            if (adminSnap.exists()) {
                console.log("Admin login successful.");
                window.location.href = "../admin/admindashboard.html";
            } else {
                errorMessage.innerText = "Access Denied: Not an Admin.";
                await signOut(auth);
            }
        } catch (error) {
            console.error("Login failed:", error);
            errorMessage.innerText = "Invalid email or password.";
        }
    });
}

// LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("Logged out successfully.");
            window.location.href = "../admin/adminlogin.html"; // Go back to login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
}
