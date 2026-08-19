const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const playerImage = new Image();
const platformImage = new Image();

platformImage.src = 'images/platform.png';

playerImage.onload = function() {
    console.log('Картинка загрузилась!');
};

playerImage.onerror = function() {
    console.log('Ошибка загрузки картинки!');
};

playerImage.src = 'images/player.png';

canvas.width = 400;
canvas.height = 600;


// ====================
// ПЕРСОНАЖ
// ====================

const player = {
    x: 165,
    y: 100,
    width: 70,
    height: 70
};


// ====================
// ПЛАТФОРМЫ
// ====================

const platforms = [
    {
        x: 150,
        y: 500,
        width: 100,
        height: 20
    },
    {
        x: 50,
        y: 410,
        width: 100,
        height: 20
    },
    {
        x: 230,
        y: 320,
        width: 100,
        height: 20
    },
    {
        x: 100,
        y: 230,
        width: 100,
        height: 20
    },
    {
        x: 200,
        y: 140,
        width: 100,
        height: 20
    }
];


// Самая верхняя платформа
let highestPlatformY = 140;


// Создание новой платформы
function createPlatform(y) {

    const previousPlatform = platforms[platforms.length - 1];

    let direction = Math.random() < 0.5 ? -1 : 1;

    let distance = 80 + Math.random() * 40;

    let newX = previousPlatform.x + direction * distance;


    // Не даём платформе выйти за левую границу
    if (newX < 0) {
        newX = 0;
    }


    // Не даём платформе выйти за правую границу
    if (newX > canvas.width - 100) {
        newX = canvas.width - 100;
    }


    return {
        x: newX,
        y: y,
        width: 100,
        height: 20
    };
}


// Добавление платформы
function addPlatform() {

    highestPlatformY -= 90;

    platforms.push(createPlatform(highestPlatformY));
}


// ====================
// ФИЗИКА
// ====================

let velocityY = -14;

const gravity = 0.5;


// ====================
// КАМЕРА
// ====================

let cameraY = 0;


// ====================
// УПРАВЛЕНИЕ
// ====================

let moveLeft = false;
let moveRight = false;


// ====================
// ИГРОВОЙ ЦИКЛ
// ====================

function gameLoop() {

    // --------------------
    // Гравитация
    // --------------------

    velocityY += gravity;

    player.y += velocityY;


    // --------------------
    // Движение влево
    // --------------------

    if (moveLeft) {

        player.x -= 6;

    }


    // --------------------
    // Движение вправо
    // --------------------

    if (moveRight) {

        player.x += 6;

    }


    // --------------------
    // Границы экрана
    // --------------------

    if (player.x < 0) {

        player.x = 0;

    }

    if (player.x + player.width > canvas.width) {

        player.x = canvas.width - player.width;

    }


    // --------------------
    // Камера
    // --------------------

    if (player.y < 200) {

        cameraY += (200 - player.y - cameraY) * 0.1;

    }


    // --------------------
    // Создание новых платформ
    // --------------------

    if (highestPlatformY > player.y - 500) {

        addPlatform();

    }


    // --------------------
    // Столкновение
    // с платформами
    // --------------------

    for (const platform of platforms) {

        if (

            player.y + player.height >= platform.y &&

            player.y + player.height <=
            platform.y + platform.height &&

            player.x + player.width >= platform.x &&

            player.x <= platform.x + platform.width &&

            velocityY > 0

        ) {

            player.y = platform.y - player.height;

            velocityY = -14;

        }

    }


    // --------------------
    // Очищаем экран
    // --------------------

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

// --------------------
// Фон — голубое небо
// --------------------

ctx.fillStyle = '#bfe8ff';

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);


// --------------------
// Облака
// --------------------

function drawCloud(x, y) {

    ctx.fillStyle = 'white';

    ctx.beginPath();

    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 55, y, 20, 0, Math.PI * 2);

    ctx.fillRect(
        x,
        y,
        55,
        20
    );

    ctx.fill();

}


// Облака

drawCloud(30, 100 + cameraY * 0.3);
drawCloud(250, 180 + cameraY * 0.3);
drawCloud(120, 380 + cameraY * 0.3);
drawCloud(300, 500 + cameraY * 0.3);

    // --------------------
    // Рисуем персонажа
    // --------------------
if (playerImage.complete && playerImage.naturalWidth > 0) {

    ctx.drawImage(
        playerImage,
        player.x,
        player.y + cameraY,
        player.width,
        player.height
    );

}


    // --------------------
    // Рисуем платформы
    // --------------------

   for (const platform of platforms) {

    ctx.drawImage(
        platformImage,
        platform.x,
        platform.y + cameraY,
        platform.width,
        platform.height
    );

}


    // --------------------
    // Следующий кадр
    // --------------------

    requestAnimationFrame(gameLoop);

}


// ====================
// КЛАВИАТУРА
// ====================

document.addEventListener('keydown', function(event) {

    if (event.key === 'ArrowLeft') {

        moveLeft = true;

    }

    if (event.key === 'ArrowRight') {

        moveRight = true;

    }

});


document.addEventListener('keyup', function(event) {

    if (event.key === 'ArrowLeft') {

        moveLeft = false;

    }

    if (event.key === 'ArrowRight') {

        moveRight = false;

    }

});


// ====================
// КНОПКА ВЛЕВО
// ====================

const leftButton =
    document.getElementById('leftButton');

if (leftButton) {

    leftButton.addEventListener('pointerdown', function(event) {

        event.preventDefault();

        moveLeft = true;

    });

    leftButton.addEventListener('pointerup', function(event) {

        event.preventDefault();

        moveLeft = false;

    });

    leftButton.addEventListener('pointerleave', function() {

        moveLeft = false;

    });

}


// ====================
// КНОПКА ВПРАВО
// ====================

const rightButton =
    document.getElementById('rightButton');

if (rightButton) {

    rightButton.addEventListener('pointerdown', function(event) {

        event.preventDefault();

        moveRight = true;

    });

    rightButton.addEventListener('pointerup', function(event) {

        event.preventDefault();

        moveRight = false;

    });

    rightButton.addEventListener('pointerleave', function() {

        moveRight = false;

    });

}


// ====================
// ЗАПУСК ИГРЫ
// ====================

gameLoop();