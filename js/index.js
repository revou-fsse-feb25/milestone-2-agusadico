//Navbar on Homepage
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add(
            'bg-cyan-500',
            'border-4',
            'border-blue-950',
            'shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]',
            'w-[calc(100%-2rem)]',
            'mx-4',
            'mt-1'
        );
    } else {
        nav.classList.remove(
            'bg-cyan-500',
            'border-4',
            'border-blue-950',
            'shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]',
            'w-[calc(100%-2rem)]',
            'mx-4',
            'mt-1'
        );
    }
});

//Accordion on Homepage
function toggleAccordion(id) {
    const content = document.getElementById(id);
    const allContents = document.querySelectorAll('[id^="accordion"]');
    const button = content.previousElementSibling;
    const allButtons = document.querySelectorAll('[onclick^="toggleAccordion"]');
    
    allContents.forEach(item => {
        if (item.id !== id) {
            item.classList.add('hidden');
            item.previousElementSibling.querySelector('span').textContent = '+';
        }
    });

    content.classList.toggle('hidden');
    button.querySelector('span').textContent = content.classList.contains('hidden') ? '+' : '-';
}

function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
    } else {
        mobileMenu.classList.add('hidden');
    }
}
