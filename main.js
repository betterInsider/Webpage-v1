// Interactive Particles Background
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

// Mouse Interactivity
const mouse = {
    x: null,
    y: null,
    radius: 120 // Radius of interaction
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    init();
}

window.addEventListener('resize', resize);

class Particle {
    constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        const colors = ['rgba(255, 255, 255, 0.4)', 'rgba(206, 175, 255, 0.5)', 'rgba(255, 255, 255, 0.2)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        if (this.baseX > width + this.size) this.baseX = -this.size;
        if (this.baseX < -this.size) this.baseX = width + this.size;
        if (this.baseY > height + this.size) this.baseY = -this.size;
        if (this.baseY < -this.size) this.baseY = height + this.size;

        this.x = this.baseX;
        this.y = this.baseY;

        if (mouse.x !== undefined && mouse.y !== undefined) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                let moveX = forceDirectionX * force * 5;
                let moveY = forceDirectionY * force * 5;
                this.x -= moveX;
                this.y -= moveY;
            }
        }

        this.draw();
    }
}

function init() {
    particles = [];
    if (window.innerWidth <= 768) return; // Prevent creating objects on mobile
    const count = Math.min((width * height) / 12000, 150);

    for (let i = 0; i < count; i++) {
        let size = (Math.random() * 2) + 0.5;
        let x = Math.random() * innerWidth;
        let y = Math.random() * innerHeight;
        let speedX = (Math.random() - 0.5) * 0.8;
        let speedY = (Math.random() - 0.5) * 0.8;
        particles.push(new Particle(x, y, size, speedX, speedY));
    }
}

function animate() {
    if (window.innerWidth <= 768) return; // Pause entire render loop on mobile
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }

    connect();
    requestAnimationFrame(animate);
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

            if (distance < (canvas.width / 15) * (canvas.height / 15)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = 'rgba(206, 175, 255,' + opacityValue * 0.15 + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Button Hover Cursor effects via Javascript for additional interactivity
const buttons = document.querySelectorAll('a.contact-btn, a.get-started-btn');
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        // Expand the particle interaction radius aggressively when hovering buttons
        // to make them "push" particles away effectively like a magnetic field!
        mouse.radius = 200; 
    });
    btn.addEventListener('mouseleave', () => {
        mouse.radius = 120; // restore default
    });
});

resize();
animate();

// --- Cursor Sparkle Trail Effect ---
let lastTrailX = 0;
let lastTrailY = 0;

window.addEventListener('mousemove', (e) => {
    let dx = e.clientX - lastTrailX;
    let dy = e.clientY - lastTrailY;
    
    // Spawn a trail sparkle if mouse moved far enough (prevents DOM flooding)
    if (Math.hypot(dx, dy) > 30) {
        lastTrailX = e.clientX;
        lastTrailY = e.clientY;
        createTrailSparkle(e.clientX, e.clientY);
    }
});

function createTrailSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    sparkle.innerHTML = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" /></svg>';
    
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    // Randomize size between 10px and 22px for a dynamic trailing effect
    const size = Math.random() * 12 + 10;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    document.body.appendChild(sparkle);
    
    // Force a DOM reflow so the transition registers
    sparkle.getBoundingClientRect();
    
    // Start the CSS fade out/drop down animation
    sparkle.classList.add('fade');
    
    setTimeout(() => {
        sparkle.remove();
    }, 600); // Match transiton time
}

// --- Scroll Entrance Animations ---
const scrollObserver = new IntersectionObserver((entries) => {
    // Process entries that are intersecting
    const intersectingEntries = entries.filter(e => e.isIntersecting);
    
    intersectingEntries.forEach((entry, index) => {
        // Create a staggered delay based on the index in the batch
        setTimeout(() => {
            entry.target.classList.add('in-view');
        }, index * 150);
        
        // Unobserve so it only happens once
        scrollObserver.unobserve(entry.target);
    });
}, { threshold: 0.2 });

// Attach observer to all service cards and animated sections
document.querySelectorAll('.service-card, .animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

// --- Carousel Logic for Our Works ---
const worksTrack = document.querySelector('.works-track');
const btnPrev = document.querySelector('.works-btn.prev');
const btnNext = document.querySelector('.works-btn.next');

if (worksTrack && btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
        worksTrack.scrollBy({ left: 390, behavior: 'smooth' }); // card width + gap
    });
    
    btnPrev.addEventListener('click', () => {
        worksTrack.scrollBy({ left: -390, behavior: 'smooth' });
    });
}

// --- Contact Form Submission & Haptic Feedback ---
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Haptic feedback (supported on most modern Android/Mobile browsers)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); 
        }
        
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.style.opacity = '0.7';

        const formData = new FormData(contactForm);
        
        // POST to Formsubmit.co
        fetch("https://formsubmit.co/ajax/hello@betterinside.site", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.innerText = 'Message Sent! ✨';
            submitBtn.style.backgroundColor = '#10B981';
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'none';
            contactForm.reset();
            
            // Success Haptic Pulse
            if (navigator.vibrate) {
                navigator.vibrate(200); 
            }
        })
        .catch(error => {
            submitBtn.innerText = 'Error Sending';
            submitBtn.style.backgroundColor = '#EF4444'; 
            submitBtn.style.opacity = '1';
            
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        });
    });
}
