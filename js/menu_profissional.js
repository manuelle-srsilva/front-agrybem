// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
});

// Fechar menu ao clicar fora
document.addEventListener('click', function() {
    dropdownMenu.classList.remove('active');
});

// Fechar menu ao clicar em um item
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        dropdownMenu.classList.remove('active');
    });
});





