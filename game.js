// Configuración del canvas para que ocupe toda la pantalla
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas); // Para que el canvas se ajuste si se cambia el tamaño de la ventana
resizeCanvas(); // Ajuste inicial del tamaño

// Cargar los sprites del jugador y los enemigos
const playerImg = new Image();
playerImg.src = "https://www.dropbox.com/scl/fi/cxdfep04woksjemqztvqc/1728540809757.png?rlkey=6xzs64ha9yzgjdsoy9zehsw87&st=fr09uubs&dl=1";

const enemyImg = new Image();
enemyImg.src = "https://www.dropbox.com/scl/fi/5kvqkxwjz44zhyickpq3s/1728540837329.png?rlkey=mf1iu0xfuc2e1iiehluwjawu9&st=oxojuqnh&dl=1";

// Definir la nave y sus propiedades
const player = {
    x: canvas.width / 2 - 42.5,
    y: canvas.height - 120, // Coloca el jugador un poco más arriba del borde
    width: 85, // Tamaño del jugador
    height: 85, // Tamaño del jugador
    speed: 5,
    direction: 'right',
    bullets: [],
    lives: 2 // Vida del jugador
};

// Definir los enemigos
const enemies = [];
const enemyBullets = []; // Para almacenar las balas enemigas
let frames = 0;
let score = 0; // Agregado: Puntuación

// Detectar toque en la pantalla para cambiar la dirección del jugador
canvas.addEventListener("touchstart", () => {
    player.direction = player.direction === 'right' ? 'left' : 'right';
});

// Clase para crear enemigos
class Enemy {
    constructor(x, y, speed, canShoot = false) {
        this.x = x;
        this.y = y;
        this.width = 70;  // Tamaño del enemigo
        this.height = 70;
        this.speed = speed;
        this.canShoot = canShoot; // Define si el enemigo puede disparar
        this.shootInterval = Math.random() * 3000 + 2000; // Tiempo aleatorio para disparar (entre 2 y 5 segundos)
        this.lastShot = 0; // Para controlar los tiempos de disparo
    }

    draw() {
        ctx.drawImage(enemyImg, this.x, this.y, this.width, this.height); // Dibuja la imagen del enemigo
    }

    update() {
        this.y += this.speed;
    }

    shoot() {
        if (this.canShoot && frames - this.lastShot > this.shootInterval) {
            enemyBullets.push({ x: this.x + this.width / 2 - 2.5, y: this.y + this.height, width: 5, height: 10, color: 'red' });
            this.lastShot = frames; // Actualiza el último frame de disparo
        }
    }
}

// Disparar balas automáticamente cada cierto tiempo (para el jugador)
function shootBullet() {
    player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, color: 'yellow' });
}

// Función para dibujar la puntuación
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Puntuación: ' + score, 10, 30);
    ctx.fillText('Vidas: ' + player.lives, canvas.width - 100, 30); // Mostrar vidas
}

// Función para revisar colisiones entre la nave y los enemigos
function checkCollision() {
    enemies.forEach((enemy, index) => {
        if (player.y < enemy.y + enemy.height &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y + player.height > enemy.y) {
            // Acción cuando el enemigo toca al jugador
            player.lives--; // Reduce la vida
            if (player.lives <= 0) {
                alert('mancota JAJJA');
                resetGame(); // Reinicia el juego
            } else {
                enemies.splice(index, 1); // Elimina el enemigo que colisiona
            }
        }
    });
}

// Función para revisar colisiones con las balas enemigas
function checkBulletCollision() {
    enemyBullets.forEach((bullet, index) => {
        if (bullet.y + bullet.height > player.y &&
            bullet.x > player.x &&
            bullet.x < player.x + player.width) {
            player.lives--; // Reduce la vida
            if (player.lives <= 0) {
                alert('botcita');
                resetGame();
            } else {
                enemyBullets.splice(index, 1); // Elimina la bala que colisiona
            }
        }
    });
}

// Función para reiniciar el juego
function resetGame() {
    enemies.length = 0; // Elimina todos los enemigos
    player.bullets.length = 0; // Elimina todas las balas
    enemyBullets.length = 0; // Elimina todas las balas enemigas
    player.x = canvas.width / 2 - 42.5; // Recoloca la nave
    player.lives = 2; // Reinicia la vida del jugador
    frames = 0;
    score = 0; // Reinicia la puntuación
}

// Función de actualización y renderizado
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover la nave automáticamente de derecha a izquierda
    if (player.direction === 'right') {
        player.x += player.speed;
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
            player.direction = 'left';
        }
    } else if (player.direction === 'left') {
        player.x -= player.speed;
        if (player.x < 0) {
            player.x = 0;
            player.direction = 'right';
        }
    }

    // Dibujar la nave usando el sprite
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Mover y dibujar balas del jugador
    player.bullets.forEach((bullet, index) => {
        bullet.y -= 10;
        if (bullet.y < 0) player.bullets.splice(index, 1);
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Crear enemigos cada 30 frames
    if (frames % 30 === 0) {
        const canShoot = Math.random() < 0.3; // Un 30% de probabilidad de que el enemigo pueda disparar
        enemies.push(new Enemy(Math.random() * (canvas.width - 70), -70, 2, canShoot));
    }

    // Mover y dibujar enemigos
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        // Si el enemigo puede disparar, dispara
        enemy.shoot();

        // Colisión con balas del jugador
        player.bullets.forEach((bullet, bIndex) => {
            if (bullet.y < enemy.y + enemy.height && bullet.x > enemy.x && bullet.x < enemy.x + enemy.width) {
                enemies.splice(index, 1);
                player.bullets.splice(bIndex, 1);
                score++; // Aumenta la puntuación cuando destruyes un enemigo
            }
        });

        // Si el enemigo sale de la pantalla
        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });

    // Dibujar y mover las balas enemigas
    enemyBullets.forEach((bullet, index) => {
        bullet.y += 4; // Velocidad de las balas enemigas
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Si las balas salen de la pantalla
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });

    // Verificar colisiones con la nave y balas enemigas
    checkCollision();
    checkBulletCollision();

    // Dibujar la puntuación
    drawScore();

    frames++;
    requestAnimationFrame(update);
}

// Disparar una bala cada 500 ms (para el jugador)
setInterval(shootBullet, 500);

update();