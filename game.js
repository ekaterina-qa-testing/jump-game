const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


// ====================
// КАРТИНКИ
// ====================

const playerImage = new Image();
const platformImage = new Image();
const monsterImage = new Image();

playerImage.src = 'images/player.png';
platformImage.src = 'images/platform.png';
monsterImage.src = 'images/monster.png';

playerImage.onload = function() {
    console.log('Картинка персонажа загрузилась!');
};

playerImage.onerror = function() {
    console.log('Ошибка загрузки картинки персонажа!');
};

platformImage.onload = function() {
    console.log('Картинка платформы загрузилась!');
};

platformImage.onerror = function() {
    console.log('Ошибка загрузки картинки платформы!');
};

monsterImage.onload = function() {
    console.log('Картинка монстрика загрузилась!');
};

monsterImage.onerror = function() {
    console.log('Ошибка загрузки картинки монстрика!');
};


// ====================
// CANVAS
// ====================

canvas.width = 400;
canvas.height = 600;


// ====================
// КНОПКА RESTART
// ====================

let restartButton =
    document.getElementById('restartButton');


// Если кнопки нет в HTML — создаём её
if (!restartButton) {

    restartButton =
        document.createElement('button');

    restartButton.id =
        'restartButton';

    restartButton.className =
        'restart-button';

    restartButton.textContent =
        'ИГРАТЬ СНОВА';

    const gameContainer =
        document.querySelector('.game-container');

    if (gameContainer) {

        gameContainer.appendChild(
            restartButton
        );
    }
}


if (restartButton) {

    restartButton.style.display = 'none';

    restartButton.addEventListener(
        'pointerdown',
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            restartGame();
        }
    );

    restartButton.addEventListener(
        'contextmenu',
        function(event) {

            event.preventDefault();

        }
    );
}


// ====================
// ПЕРСОНАЖ
// ====================

const player = {
    x: 165,
    y: 100,
    width: 55,
    height: 70
};


// ====================
// СТАРТОВЫЕ ПЛАТФОРМЫ
// ====================

const startPlatforms = [

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


let platforms =
    startPlatforms.map(function(platform) {

        return { ...platform };

    });


let highestPlatformY = 140;


// ====================
// СОЗДАНИЕ ПЛАТФОРМЫ
// ====================

function createPlatform(y) {

    const previousPlatform =
        platforms[
            platforms.length - 1
        ];

    const direction =
        Math.random() < 0.5
            ? -1
            : 1;

    const distance =
        80 + Math.random() * 40;

    let newX =
        previousPlatform.x +
        direction * distance;


    if (newX < 0) {

        newX = 0;

    }


    if (
        newX >
        canvas.width - 100
    ) {

        newX =
            canvas.width - 100;

    }


    return {

        x: newX,
        y: y,
        width: 100,
        height: 20

    };
}


// ====================
// ДОБАВЛЕНИЕ ПЛАТФОРМЫ
// ====================

function addPlatform() {

    highestPlatformY -= 90;

    platforms.push(
        createPlatform(
            highestPlatformY
        )
    );
}


// ====================
// ФИЗИКА
// ====================

let velocityY = -14;

const gravity = 0.5;


// ====================
// ВРЕМЯ КАДРА
// ====================

let lastTime = 0;


// ====================
// КАМЕРА
// ====================

let cameraY = 0;


// ====================
// СЧЁТ
// ====================

let score = 0;

let highestPlayerY =
    player.y;


let bestScore =
    Number(
        localStorage.getItem(
            'bestScore'
        )
    ) || 0;


// ====================
// СОСТОЯНИЕ ИГРЫ
// ====================

let gameOver = false;


// ====================
// УПРАВЛЕНИЕ
// ====================

let moveLeft = false;
let moveRight = false;


// ====================
// ОБЛАКА
// ====================

const startClouds = [

    {
        x: 30,
        y: 100,
        size: 1
    },

    {
        x: 250,
        y: 180,
        size: 0.9
    },

    {
        x: 120,
        y: 380,
        size: 1.2
    },

    {
        x: 300,
        y: 500,
        size: 0.8
    }

];


let clouds =
    startClouds.map(function(cloud) {

        return { ...cloud };

    });


let highestCloudY = 500;


// ====================
// СОЗДАНИЕ ОБЛАКА
// ====================

function createCloud(y) {

    return {

        x: Math.random() * 330,

        y: y,

        size:
            0.8 +
            Math.random() * 0.6

    };
}


// ====================
// ДОБАВЛЕНИЕ ОБЛАКА
// ====================

function addCloud() {

    highestCloudY -=
        140 +
        Math.random() * 100;


    clouds.push(
        createCloud(
            highestCloudY
        )
    );
}


// ====================
// РИСОВАНИЕ ОБЛАКА
// ====================

function drawCloud(
    x,
    y,
    size
) {

    ctx.fillStyle =
        'white';


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        20 * size,
        0,
        Math.PI * 2
    );


    ctx.arc(
        x + 25 * size,
        y - 10 * size,
        25 * size,
        0,
        Math.PI * 2
    );


    ctx.arc(
        x + 55 * size,
        y,
        20 * size,
        0,
        Math.PI * 2
    );


    ctx.fillRect(
        x,
        y,
        55 * size,
        20 * size
    );


    ctx.fill();
}


// ====================
// ПОМЕХИ
// ====================

let obstacles = [];

let highestObstacleY = 50;


// ====================
// СОЗДАНИЕ ПОМЕХИ
// ====================

function createObstacle(y) {

    return {

        x: Math.random() * 330,

        y: y,

        width: 35,

        height: 35,

        speed:
            2 +
            Math.random() * 1.5,

        direction:
            Math.random() < 0.5
                ? -1
                : 1

    };
}


// ====================
// ДОБАВЛЕНИЕ ПОМЕХИ
// ====================

function addObstacle() {

    highestObstacleY -=
        300 +
        Math.random() * 180;


    obstacles.push(
        createObstacle(
            highestObstacleY
        )
    );
}


// ====================
// ДВИЖЕНИЕ ПОМЕХ
// ====================

function updateObstacles(deltaTime) {

    for (
        const obstacle
        of obstacles
    ) {

        obstacle.x +=
            obstacle.speed *
            obstacle.direction *
            deltaTime;


        if (
            obstacle.x <= 0 ||
            obstacle.x +
            obstacle.width >=
            canvas.width
        ) {

            obstacle.direction *= -1;

        }
    }
}


// ====================
// СТОЛКНОВЕНИЕ С ПОМЕХОЙ
// ====================

function checkObstacleCollision(
    obstacle
) {

    const playerLeft =
        player.x + 10;

    const playerRight =
        player.x +
        player.width -
        10;

    const playerTop =
        player.y + 10;

    const playerBottom =
        player.y +
        player.height -
        10;


    const obstacleLeft =
        obstacle.x;

    const obstacleRight =
        obstacle.x +
        obstacle.width;

    const obstacleTop =
        obstacle.y;

    const obstacleBottom =
        obstacle.y +
        obstacle.height;


    return (

        playerRight >
        obstacleLeft &&

        playerLeft <
        obstacleRight &&

        playerBottom >
        obstacleTop &&

        playerTop <
        obstacleBottom

    );
}


// ====================
// BEST SCORE
// ====================

function updateBestScore() {

    if (
        score >
        bestScore
    ) {

        bestScore =
            score;


        localStorage.setItem(
            'bestScore',
            bestScore
        );
    }
}


// ====================
// GAME OVER
// ====================

function drawGameOver() {

    ctx.fillStyle =
        'rgba(0, 0, 0, 0.6)';


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        'white';


    ctx.textAlign =
        'center';


    ctx.font =
        'bold 38px Arial';


    ctx.fillText(
        'GAME OVER',
        canvas.width / 2,
        230
    );


    ctx.font =
        '24px Arial';


    ctx.fillText(
        'SCORE: ' + score,
        canvas.width / 2,
        275
    );


    ctx.fillText(
        'BEST: ' + bestScore,
        canvas.width / 2,
        310
    );


    ctx.textAlign =
        'left';


    if (restartButton) {

        restartButton.style.display =
            'block';

    }
}


// ====================
// ПЕРЕЗАПУСК
// ====================

function restartGame() {

    if (restartButton) {

        restartButton.style.display =
            'none';
    }


    // Персонаж

    player.x = 165;
    player.y = 100;


    // Физика

    velocityY = -14;


    // Время

    lastTime = 0;


    // Камера

    cameraY = 0;


    // Счёт

    score = 0;

    highestPlayerY =
        player.y;


    // Платформы

    platforms =
        startPlatforms.map(
            function(platform) {

                return {
                    ...platform
                };

            }
        );


    highestPlatformY =
        140;


    // Облака

    clouds =
        startClouds.map(
            function(cloud) {

                return {
                    ...cloud
                };

            }
        );


    highestCloudY =
        500;


    // Помехи

    obstacles = [];

    highestObstacleY =
        50;


    // Состояние

    gameOver = false;


    // Управление

    moveLeft = false;
    moveRight = false;


    requestAnimationFrame(
        gameLoop
    );
}


// ====================
// ИГРОВОЙ ЦИКЛ
// ====================

function gameLoop(currentTime) {

    // ====================
    // НОРМАЛИЗАЦИЯ ВРЕМЕНИ
    // ====================

    if (lastTime === 0) {

        lastTime =
            currentTime;

    }


    let deltaTime =
        (
            currentTime -
            lastTime
        ) / 16.67;


    lastTime =
        currentTime;


    // Защита от большого скачка
    // при возвращении на вкладку

    if (deltaTime > 2) {

        deltaTime = 2;

    }


    if (deltaTime < 0) {

        deltaTime = 0;

    }


    // ====================
    // GAME OVER
    // ====================

    if (gameOver) {

        drawGameOver();

        return;
    }


    // ====================
    // ГРАВИТАЦИЯ
    // ====================

    velocityY +=
        gravity *
        deltaTime;


    player.y +=
        velocityY *
        deltaTime;


    // ====================
    // ДВИЖЕНИЕ
    // ====================

    const horizontalSpeed =
        6;


    if (moveLeft) {

        player.x -=
            horizontalSpeed *
            deltaTime;

    }


    if (moveRight) {

        player.x +=
            horizontalSpeed *
            deltaTime;

    }


    // ====================
    // ГРАНИЦЫ ПО БОКАМ
    // ====================

    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;

    }


    // ====================
    // КАМЕРА
    // ====================

    if (
        player.y < 200
    ) {

        const targetCameraY =
            200 -
            player.y;


        if (
            targetCameraY >
            cameraY
        ) {

            cameraY +=
                (
                    targetCameraY -
                    cameraY
                ) * 0.1;

        }
    }


    // ====================
    // СЧЁТ
    // ====================

    if (
        player.y <
        highestPlayerY
    ) {

        highestPlayerY =
            player.y;


        score =
            Math.max(
                score,
                Math.floor(
                    (100 - highestPlayerY) /
                    10
                )
            );


        updateBestScore();

    }


    // ====================
    // НОВЫЕ ПЛАТФОРМЫ
    // ====================

    if (
        highestPlatformY >
        player.y - 500
    ) {

        addPlatform();

    }


    // ====================
    // НОВЫЕ ОБЛАКА
    // ====================

    if (
        highestCloudY >
        player.y - 900
    ) {

        addCloud();

    }


    // ====================
    // НОВЫЕ ПОМЕХИ
    // ====================

    if (
        highestObstacleY >
        player.y - 1000
    ) {

        addObstacle();

    }


    // ====================
    // СТОЛКНОВЕНИЕ
    // С ПЛАТФОРМАМИ
    // ====================

    for (
        const platform
        of platforms
    ) {

        const playerBottom =
            player.y +
            player.height -
            12;


        if (

            playerBottom >=
            platform.y &&

            playerBottom <=
            platform.y +
            platform.height +
            2 &&

            player.x +
            player.width -
            25 >=
            platform.x &&

            player.x +
            25 <=
            platform.x +
            platform.width &&

            velocityY > 0

        ) {

            player.y =
                platform.y -
                player.height +
                12;


            velocityY = -14;
        }
    }


    // ====================
    // ДВИЖЕНИЕ ПОМЕХ
    // ====================

    updateObstacles(
        deltaTime
    );


    // ====================
    // СТОЛКНОВЕНИЕ
    // С ПОМЕХАМИ
    // ====================

    for (
        const obstacle
        of obstacles
    ) {

        if (
            checkObstacleCollision(
                obstacle
            )
        ) {

            updateBestScore();

            gameOver =
                true;

            drawGameOver();

            return;
        }
    }


    // ====================
    // ПРОВЕРКА ПАДЕНИЯ
    // ====================

    const playerScreenY =
        player.y +
        cameraY;


    const playerScreenBottom =
        playerScreenY +
        player.height;


    if (
        playerScreenBottom >
        canvas.height + 20
    ) {

        updateBestScore();

        gameOver =
            true;

        drawGameOver();

        return;
    }


    // ====================
    // ОЧИЩАЕМ ЭКРАН
    // ====================

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ====================
    // ГОЛУБОЕ НЕБО
    // ====================

    ctx.fillStyle =
        '#bfe8ff';


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ====================
    // ОБЛАКА
    // ====================

    for (
        const cloud
        of clouds
    ) {

        drawCloud(

            cloud.x,

            cloud.y +
            cameraY * 0.3,

            cloud.size

        );
    }


    // ====================
    // SCORE
    // ====================

    ctx.fillStyle =
        '#333';


    ctx.font =
        'bold 24px Arial';


    ctx.textAlign =
        'left';


    ctx.fillText(
        'SCORE: ' +
        score,
        15,
        35
    );


    // ====================
    // BEST
    // ====================

    ctx.textAlign =
        'right';


    ctx.fillText(
        'BEST: ' +
        bestScore,
        canvas.width - 15,
        35
    );


    ctx.textAlign =
        'left';


    // ====================
    // МОНСТРИКИ
    // ====================

    for (
        const obstacle
        of obstacles
    ) {

        if (
            monsterImage.complete &&
            monsterImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                monsterImage,

                obstacle.x,

                obstacle.y +
                cameraY,

                obstacle.width,
                obstacle.height

            );
        }
    }


    // ====================
    // ПЕРСОНАЖ
    // ====================

    if (
        playerImage.complete &&
        playerImage.naturalWidth > 0
    ) {

        ctx.drawImage(

            playerImage,

            player.x,

            playerScreenY,

            player.width,
            player.height

        );
    }


    // ====================
    // ПЛАТФОРМЫ
    // ====================

    for (
        const platform
        of platforms
    ) {

        if (
            platformImage.complete &&
            platformImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                platformImage,

                platform.x,

                platform.y +
                cameraY,

                platform.width,
                platform.height

            );
        }
    }


    // ====================
    // СЛЕДУЮЩИЙ КАДР
    // ====================

    requestAnimationFrame(
        gameLoop
    );
}


// ====================
// КЛАВИАТУРА
// ====================

document.addEventListener(
    'keydown',
    function(event) {

        if (
            event.key ===
            'ArrowLeft'
        ) {

            moveLeft = true;

        }


        if (
            event.key ===
            'ArrowRight'
        ) {

            moveRight = true;

        }
    }
);


document.addEventListener(
    'keyup',
    function(event) {

        if (
            event.key ===
            'ArrowLeft'
        ) {

            moveLeft = false;

        }


        if (
            event.key ===
            'ArrowRight'
        ) {

            moveRight = false;

        }
    }
);


// ====================
// КНОПКА ВЛЕВО
// ====================

const leftButton =
    document.getElementById(
        'leftButton'
    );


if (leftButton) {

    leftButton.addEventListener(
        'pointerdown',
        function(event) {

            event.preventDefault();

            moveLeft = true;
        }
    );


    leftButton.addEventListener(
        'pointerup',
        function(event) {

            event.preventDefault();

            moveLeft = false;
        }
    );


    leftButton.addEventListener(
        'pointerleave',
        function() {

            moveLeft = false;
        }
    );


    leftButton.addEventListener(
        'contextmenu',
        function(event) {

            event.preventDefault();

        }
    );
}


// ====================
// КНОПКА ВПРАВО
// ====================

const rightButton =
    document.getElementById(
        'rightButton'
    );


if (rightButton) {

    rightButton.addEventListener(
        'pointerdown',
        function(event) {

            event.preventDefault();

            moveRight = true;
        }
    );


    rightButton.addEventListener(
        'pointerup',
        function(event) {

            event.preventDefault();

            moveRight = false;
        }
    );


    rightButton.addEventListener(
        'pointerleave',
        function() {

            moveRight = false;
        }
    );


    rightButton.addEventListener(
        'contextmenu',
        function(event) {

            event.preventDefault();

        }
    );
}


// ====================
// ЗАПУСК
// ====================

requestAnimationFrame(
    gameLoop
);