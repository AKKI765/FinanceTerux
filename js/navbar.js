// navbar.js
import { auth } from "../js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

(function() {
    const navbarHTML = `
        <nav class="navbar">
          <div class="logo">
            <img id="logoSvg" src="../logo.svg" alt="My SVG Image">
            <h2>FinanceTerux</h2>
          </div>
          <div class="nav-menu">
            <ul class="nav-links">
                    <li><a href="../pages/dashboard.html">Home</a></li>
                    <li><a href="../pages/transactions.html">Transactions</a></li>
                    <li><a href="../pages/budget.html">Budget</a></li>
                    <li><a href="../pages/charts.html">Chart</a></li>
                    <li><a href="../pages/history.html">History</a></li>
                    <li><a href="../pages/setting.html">Profile Settings</a></li>
                </ul>
          </div>
          <div class="auth-menu">
                <div class="auth-buttons">
                    <h3 id="navbarGreeting"></h3>
                    <button id="logout">
                        <a href="#" style="color: white; text-decoration: none;">Logout</a>
                    </button>
                </div>
          </div>
        </nav>  

        <div class="ham">
          <div class="hamburger">☰</div>
          <div class="close">✖︎</div>
        </div>
        
    `;

    const navbarContainer = document.querySelector('.navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
        setupAuthListener();
    } else {
        console.error('Navbar container not found!');
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

    function setupAuthListener() {
        const greeting = document.getElementById('navbarGreeting');
        const logoutBtn = document.getElementById('logout');

        // Listen for user authentication state
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // If user is logged in
                const email = user.email;
                const userName = user.displayName || email.substring(0, email.indexOf('@'));
                greeting.textContent = `Hi, ${userName}`;
                logoutBtn.style.display = "inline-block";
            } else {
                // No user is signed in
                greeting.textContent = "Hello, Guest";
                logoutBtn.style.display = "none";
            }
        });

        // Handle logout
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth).then(() => {
                console.log("User signed out.");
                window.location.href = '../index.html'; // Redirect to login
            }).catch((error) => {
                console.error("Logout error:", error.message);
            });
        });
    }
})();
