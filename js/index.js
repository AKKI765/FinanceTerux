

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