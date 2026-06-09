const canvas = document.getElementById('heart');
const ctx = canvas.getContext('2d');
const musica = document.getElementById('musica');
const startBtn = document.getElementById('startBtn');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');

let width, height;
let heartParticles = [];
let backgroundStars = [];
let shootingStars = [];
let floatingTexts = []; 
let animationRunning = false;

const particleCount = 800; 
const starCount = 200;
const messages = [
    "Eres mi universo",
    "Brillas intensamente",
    "Mi amor eterno",
    "Eres mi estrella favorita",
    "Mi lugar favorito en el mundo es contigo",
    "Eres la luz de mi vida",
    "Eres una en un millón",
    "Contigo, cada momento es mágico"
];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function getHeartPoint(t) {
    const scale = Math.min(width, height) / 30; 
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale + width / 2, y: y * scale + height / 2 - 50 };
}

// --- CLASES ---

class HeartParticle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.t = Math.random() * Math.PI * 2;
        const target = getHeartPoint(this.t);
        this.targetX = target.x; this.targetY = target.y;
        this.size = Math.random() * 2.5 + 1.5; 
        this.speed = Math.random() * 0.04 + 0.015;
        this.opacity = 0;
    }
    update() {
        this.x += (this.targetX - this.x) * this.speed;
        this.y += (this.targetY - this.y) * this.speed;
        this.opacity = Math.sin(Date.now() * 0.001 + this.t) * 0.5 + 0.5;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity})`;
        ctx.shadowBlur = 8; ctx.shadowColor = "#DC143C";
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill(); ctx.shadowBlur = 0;
    }
}

class FloatingText {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * (width - 150) + 75;
        this.y = Math.random() * (height - 150) + 75;
        // Evitar el centro exacto donde está el texto principal
        if (Math.abs(this.x - width/2) < 100 && Math.abs(this.y - height/2) < 100) this.y += 150;
        
        this.text = messages[Math.floor(Math.random() * messages.length)];
        this.size = Math.random() * 8 + 14; 
        this.opacity = 0;
        this.state = "fadeIn";
        this.timer = 0;
        this.waitDuration = Math.random() * 100 + 100;
    }
    update() {
        if (this.state === "fadeIn") {
            this.opacity += 0.01;
            if (this.opacity >= 1) this.state = "wait";
        } else if (this.state === "wait") {
            this.timer++;
            if (this.timer >= this.waitDuration) this.state = "fadeOut";
        } else if (this.state === "fadeOut") {
            this.opacity -= 0.01;
            if (this.opacity <= 0) this.reset();
        }
    }
    draw() {
        ctx.font = `italic ${this.size}px Arial`;
        ctx.fillStyle = `rgba(180, 255, 0, ${this.opacity})`; 
        ctx.shadowColor = `rgba(180, 255, 0, ${this.opacity})`;
        ctx.shadowBlur = 5;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0;
    }
}

class Star {
    constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.size = Math.random() * 1.2; }
    draw() {
        let op = Math.abs(Math.sin(Date.now() * 0.001 + this.x));
        ctx.fillStyle = `rgba(255, 255, 255, ${op})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}

class ShootingStar {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width; this.y = -20;
        this.len = Math.random() * 60 + 20; this.speed = Math.random() * 12 + 6;
        this.active = false; this.wait = Date.now() + Math.random() * 4000;
    }
    update() {
        if (this.active) {
            this.x -= this.speed; this.y += this.speed;
            if (this.y > height || this.x < 0) this.reset();
        } else if (Date.now() > this.wait) this.active = true;
    }
    draw() {
        if (!this.active) return;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.len, this.y - this.len); ctx.stroke();
    }
}

// --- CORE ---

function init() {
    heartParticles = []; backgroundStars = []; shootingStars = []; floatingTexts = [];
    for (let i = 0; i < starCount; i++) backgroundStars.push(new Star());
    for (let i = 0; i < particleCount; i++) heartParticles.push(new HeartParticle());
    for (let i = 0; i < 2; i++) shootingStars.push(new ShootingStar());
    for (let i = 0; i < 6; i++) floatingTexts.push(new FloatingText()); // 6 textos a la vez
}

function animate() {
    if (!animationRunning) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);

    backgroundStars.forEach(s => s.draw());
    
    // AQUÍ SE AGREGARON LOS TEXTOS
    floatingTexts.forEach(t => { t.update(); t.draw(); });
    
    shootingStars.forEach(s => { s.update(); s.draw(); });
    heartParticles.forEach(p => { p.update(); p.draw(); });
    
    requestAnimationFrame(animate);
}

startBtn.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        mainContent.style.display = 'block';
        resize(); init();
        animationRunning = true;
        musica.volume = 0.5; musica.play();
        animate();
    }, 800);
});

window.addEventListener('resize', () => {
    resize();
    if(animationRunning) init();
});
