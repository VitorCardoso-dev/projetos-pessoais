const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('nav a');

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Bloqueia o scroll do body quando o menu está aberto
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'initial';
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Fecha o menu ao clicar em qualquer link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(navMenu.classList.contains('active')) toggleMenu();
        });
    });

    const slides = document.querySelectorAll('.carousel .slide img');
    const prev   = document.querySelector('.prev');
    const next   = document.querySelector('.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    let index = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => { index = i; showSlide(index); });
        indicatorsContainer.appendChild(dot);
    });

    const dots = indicatorsContainer.querySelectorAll('span');

    function showSlide(i) {
        slides.forEach(img => img.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[i].classList.add('active');
        dots[i].classList.add('active');
    }

    next.addEventListener('click', () => { index = (index + 1) % slides.length; showSlide(index); });
    prev.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; showSlide(index); });
    setInterval(() => { index = (index + 1) % slides.length; showSlide(index); }, 5000);