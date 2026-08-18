const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;


// ====================
// ПЕРСОНАЖ
// ====================

const player = {
    x: 175,
    y: 100,
    width: 50,
    height: 50
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
    // Рисуем персонажа
    // --------------------

    ctx.fillStyle = 'black';

    ctx.fillRect(

        player.x,

        player.y + cameraY,

        player.width,

        player.height

    );


    // --------------------
    // Рисуем платформы
    // --------------------

    ctx.fillStyle = 'green';


    for (const platform of platforms) {

        ctx.fillRect(

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