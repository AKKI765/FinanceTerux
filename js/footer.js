// footer.js
const footer = document.createElement('footer');
footer.innerHTML = `
  <div class="footer-links">
    
    <a href="../support/about.html">About</a>
    <a href="../support/contact.html">Contact</a>
    <a href="../support/privacy.html">Privacy Policy</a>
    <a href="../support/terms.html">Terms & Conditions</a>
    
  </div>
  <div class="social-icons">
    <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
    <a href="https://twitter.com" target="_blank"><i class="fab fa-twitter"></i></a>
    <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
    <a href="https://www.linkedin.com/in/atul-kumar-047322268/" target="_blank"><i class="fab fa-linkedin"></i></a>
    <a href="https://github.com/AKKI765/" target="_blank"><i class="fab fa-github"></i></a>
  </div>
  <div class="copyright">
    &copy; ${new Date().getFullYear()} FinanceTerux. All rights reserved.
  </div>
`;
document.body.appendChild(footer);
