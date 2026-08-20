const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


// ==================================================
// КАРТИНКИ
// ==================================================

const playerImage = new Image();
const platformImage = new Image();
const monsterImage = new Image();

playerImage.src = 'images/player.png';
platformImage.src = 'images/platform.png';
monsterImage.src = 'images/monster.png';

playerImage.onload = function () {
    console.log('Картинка персонажа загрузилась!');
};

playerImage.onerror = function () {
    console.log('Ошибка загрузки картинки персонажа!');
};

platformImage.onload = function () {
    console.log('Картинка платформы загрузилась!');
};

platformImage.onerror = function () {
    console.log('Ошибка загрузки картинки платформы!');
};

monsterImage.onload = function () {
    console.log('Картинка монстрика загрузилась!');
};

monsterImage.onerror = function () {
    console.log('Ошибка загрузки картинки монстрика!');
};


// ==================================================
// CANVAS
// ==================================================

canvas.width = 400;
canvas.height = 600;


// ==================================================
// RESTART BUTTON
// ==================================================

let restartButton = document.getElementById('restartButton');

if (!restartButton) {

    restartButton = document.createElement('button');

    restartButton.id = 'restartButton';
    restartButton.textContent = 'ИГРАТЬ СНОВА';

    const gameContainer = document.querySelector('.game-container');

    if (gameContainer) {
        gameContainer.appendChild(restartButton);
    }
}

if (restartButton) {

    restartButton.style.display = 'none';
    restartButton.style.position = 'fixed';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translateX(-50%)';
    restartButton.style.bottom = '95px';
    restartButton.style.width = '200px';
    restartButton.style.height = '60px';
    restartButton.style.zIndex = '2000';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '15px';
    restartButton.style.background = 'white';
    restartButton.style.color = '#333';
    restartButton.style.fontSize = '20px';
    restartButton.style.fontWeight = 'bold';
    restartButton.style.touchAction = 'manipulation';

    restartButton.addEventListener('pointerdown', function (event) {

        event.preventDefault();
        event.stopPropagation();

        restartGame();
    });

    restartButton.addEventListener('contextmenu', function (event) {

        event.preventDefault();
    });
}


// ==================================================
// ПЕРСОНАЖ
// ==================================================

const player = {
    x: 165,
    y: 100,
    width: 55,
    height: 70
};


// ==================================================
// СТАРТОВЫЕ ПЛАТФОРМЫ
// ==================================================

const startPlatforms = [
    {
        x: 150,
        y: 500,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    },

    {
        x: 50,
        y: 410,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    },

    {
        x: 230,
        y: 320,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    },

    {
        x: 100,
        y: 230,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    },

    {
        x: 200,
        y: 140,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    }
];

let platforms = startPlatforms.map(function (platform) {
    return { ...platform };
});

let highestPlatformY = 140;


// ==================================================
// ФИЗИКА
// ==================================================

let velocityY = -14;
const gravity = 0.5;

let lastTime = 0;


// ==================================================
// КАМЕРА
// ==================================================

let cameraY = 0;


// ==================================================
// SCORE
// ==================================================

let score = 0;

let highestPlayerY = player.y;

let bestScore =
    Number(localStorage.getItem('bestScore')) || 0;


// ==================================================
// ПРИЗЕМЛЕНИЯ
// ==================================================

let platformsLanded = 0;
let lastLandedPlatform = null;


// ==================================================
// РАКЕТА
// ==================================================

// 10-е, 20-е, 30-е, 40-е...

let nextRocketLanding = 10;

// Нужно ли сейчас создавать ракету

let rocketPending = false;


// ==================================================
// РАКЕТНЫЙ ПОЛЁТ
// ==================================================

let rockets = [];

let rocketActive = false;

let activeRocket = null;

let rocketTime = 0;


// Примерно 6 секунд

const rocketDuration = 6000;


// На сколько платформ вверх

const ROCKET_PLATFORMS_UP = 20;


// Платформа, на которую приземляемся

let rocketLandingPlatform = null;


// Начальная координата игрока

let rocketStartY = 0;


// Точная конечная координата игрока

let rocketTargetY = 0;


// ==================================================
// БЕЗОПАСНАЯ ПЛАТФОРМА
// ==================================================

let safeRocketPlatform = null;

let safeRocketPlatformUntil = 0;


// ==================================================
// GAME STATE
// ==================================================

let gameOver = false;


// ==================================================
// УПРАВЛЕНИЕ
// ==================================================

let moveLeft = false;
let moveRight = false;


// ==================================================
// ОБЛАКА
// ==================================================

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

let clouds = startClouds.map(function (cloud) {
    return { ...cloud };
});

let highestCloudY = 500;


function createCloud(y) {

    return {
        x: Math.random() * 330,
        y: y,
        size: 0.8 + Math.random() * 0.6
    };
}


function addCloud() {

    highestCloudY -=
        140 + Math.random() * 100;

    clouds.push(
        createCloud(highestCloudY)
    );
}


function drawCloud(x, y, size) {

    ctx.fillStyle = 'white';

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


// ==================================================
// ОБЫЧНЫЕ ПЛАТФОРМЫ
// ==================================================

function getNormalPlatforms() {

    return platforms.filter(function (platform) {

        return !platform.isAlternative;
    });
}


function createPlatform(y) {

    const normalPlatforms =
        getNormalPlatforms();

    const previousPlatform =
        normalPlatforms[
            normalPlatforms.length - 1
        ];

    const direction =
        Math.random() < 0.5 ? -1 : 1;

    const distance =
        80 + Math.random() * 40;

    let newX =
        previousPlatform.x +
        direction * distance;

    if (newX < 0) {
        newX = 0;
    }

    if (newX > canvas.width - 100) {
        newX = canvas.width - 100;
    }

    return {
        x: newX,
        y: y,
        width: 100,
        height: 20,
        isAlternative: false,
        isRocketLanding: false
    };
}


function createAlternativePlatform(dangerousPlatform) {

    let newX;

    if (dangerousPlatform.x < 200) {

        newX = Math.max(
            0,
            dangerousPlatform.x - 150
        );

    } else {

        newX = Math.min(
            canvas.width - 100,
            dangerousPlatform.x + 150
        );
    }

    return {
        x: newX,
        y: dangerousPlatform.y,
        width: 100,
        height: 20,
        isAlternative: true,
        isRocketLanding: false
    };
}


function addPlatform() {

    highestPlatformY -= 90;

    const newPlatform =
        createPlatform(highestPlatformY);

    platforms.push(newPlatform);

    maybeAddObstacleArea(newPlatform);

    checkRocketPending();
}


// ==================================================
// ПОМЕХИ / МОНСТРИКИ
// ==================================================

let obstacles = [];

let lastObstaclePlatformIndex = -10;


function createObstacle(y) {

    return {
        x: Math.random() * 330,
        y: y,
        width: 35,
        height: 35,
        speed: 2 + Math.random() * 1.5,
        direction:
            Math.random() < 0.5 ? -1 : 1
    };
}


function addObstacle(platform) {

    // На платформу для ракеты
    // монстра не ставим

    if (platform.isRocketLanding) {
        return;
    }

    const obstacle =
        createObstacle(
            platform.y - 65
        );

    if (platform.x < 200) {

        obstacle.x =
            Math.min(
                canvas.width -
                obstacle.width,
                platform.x + 60
            );

    } else {

        obstacle.x =
            Math.max(
                0,
                platform.x - 20
            );
    }

    obstacles.push(obstacle);

    lastObstaclePlatformIndex =
        getNormalPlatforms().indexOf(platform);
}


function maybeAddObstacleArea(platform) {

    // На ракетной платформе
    // монстр никогда не появляется

    if (platform.isRocketLanding) {
        return;
    }

    const normalPlatforms =
        getNormalPlatforms();

    const index =
        normalPlatforms.indexOf(platform);

    if (index < 0) {
        return;
    }

    // Монстрики не слишком часто

    if (
        index -
        lastObstaclePlatformIndex <
        6
    ) {
        return;
    }

    // Вероятность

    if (
        Math.random() > 0.30
    ) {
        return;
    }

    addObstacle(platform);

    // Обязательно добавляем
    // альтернативную платформу
    // с другой стороны

    const alternativePlatform =
        createAlternativePlatform(
            platform
        );

    platforms.push(
        alternativePlatform
    );
}


function updateObstacles(deltaTime) {

    for (const obstacle of obstacles) {

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


function isNearRocketLandingPlatform(
    obstacle,
    platform
) {

    if (!platform) {
        return false;
    }

    const left =
        platform.x - 80;

    const right =
        platform.x +
        platform.width +
        80;

    const top =
        platform.y - 120;

    const bottom =
        platform.y + 70;

    const centerX =
        obstacle.x +
        obstacle.width / 2;

    const centerY =
        obstacle.y +
        obstacle.height / 2;

    return (
        centerX >= left &&
        centerX <= right &&
        centerY >= top &&
        centerY <= bottom
    );
}


function checkObstacleCollision(obstacle) {

    // На безопасной платформе
    // монстр не опасен

    if (
        isNearRocketLandingPlatform(
            obstacle,
            safeRocketPlatform
        )
    ) {
        return false;
    }

    const playerLeft =
        player.x + 15;

    const playerRight =
        player.x +
        player.width -
        15;

    const playerTop =
        player.y + 15;

    const playerBottom =
        player.y +
        player.height -
        15;

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
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        playerBottom > obstacleTop &&
        playerTop < obstacleBottom
    );
}


// ==================================================
// СОЗДАНИЕ БУДУЩИХ ПЛАТФОРМ ДЛЯ РАКЕТЫ
// ==================================================

function prepareRocketRoute() {

    if (!lastLandedPlatform) {
        return null;
    }

    const normalPlatforms =
        getNormalPlatforms();

    const currentIndex =
        normalPlatforms.indexOf(
            lastLandedPlatform
        );

    if (currentIndex < 0) {
        return null;
    }

    const targetIndex =
        currentIndex +
        ROCKET_PLATFORMS_UP;

    // Создаём платформы,
    // пока не будет точки посадки

    while (
        getNormalPlatforms().length <=
        targetIndex
    ) {

        highestPlatformY -= 90;

        const newPlatform =
            createPlatform(
                highestPlatformY
            );

        platforms.push(newPlatform);
    }

    const updatedPlatforms =
        getNormalPlatforms();

    const landingPlatform =
        updatedPlatforms[targetIndex];

    if (!landingPlatform) {
        return null;
    }

    // Эта платформа теперь
    // предназначена для ракеты

    landingPlatform.isRocketLanding =
        true;

    // Убираем возможных монстриков
    // рядом с ней

    obstacles =
        obstacles.filter(function (obstacle) {

            return !isNearRocketLandingPlatform(
                obstacle,
                landingPlatform
            );
        });

    // Включаем безопасную зону

    safeRocketPlatform =
        landingPlatform;

    safeRocketPlatformUntil =
        Infinity;

    return landingPlatform;
}


// ==================================================
// ДОБАВЛЕНИЕ РАКЕТЫ ВПЕРЕДИ
// ==================================================

function addRocketAhead() {

    if (!lastLandedPlatform) {
        return;
    }

    if (rocketActive) {
        return;
    }

    const existingRocket =
        rockets.some(function (rocket) {

            return rocket.active;
        });

    if (existingRocket) {
        return;
    }

    const normalPlatforms =
        getNormalPlatforms();

    const currentIndex =
        normalPlatforms.indexOf(
            lastLandedPlatform
        );

    if (currentIndex < 0) {
        return;
    }

    // Ракета появляется
    // на платформе впереди

    const rocketPlatform =
        normalPlatforms[
            currentIndex + 3
        ];

    if (!rocketPlatform) {
        return;
    }

    // Не ставим ракеты
    // на специальные альтернативные
    // платформы

    if (
        rocketPlatform.isAlternative
    ) {
        return;
    }

    const rocket = {

        x:
            rocketPlatform.x + 10,

        y:
            rocketPlatform.y - 72,

        width: 44,

        height: 65,

        active: true,

        platform:
            rocketPlatform
    };

    rockets.push(rocket);

    console.log(
        '🚀 РАКЕТА ПОЯВИЛАСЬ ВПЕРЕДИ!'
    );
}


// ==================================================
// ПРОВЕРКА РАКЕТЫ
// ==================================================

function checkRocketPending() {

    if (!rocketPending) {
        return;
    }

    if (rocketActive) {
        return;
    }

    const existingRocket =
        rockets.some(function (rocket) {

            return rocket.active;
        });

    if (existingRocket) {
        return;
    }

    addRocketAhead();

    if (
        rockets.some(function (rocket) {
            return rocket.active;
        })
    ) {

        rocketPending = false;

        nextRocketLanding += 10;
    }
}


// ==================================================
// СТОЛКНОВЕНИЕ С РАКЕТОЙ
// ==================================================

function checkRocketCollision(rocket) {

    const playerLeft =
        player.x + 8;

    const playerRight =
        player.x +
        player.width -
        8;

    const playerTop =
        player.y + 8;

    const playerBottom =
        player.y +
        player.height -
        8;

    return (
        playerRight > rocket.x &&
        playerLeft <
            rocket.x +
            rocket.width &&
        playerBottom > rocket.y &&
        playerTop <
            rocket.y +
            rocket.height
    );
}


// ==================================================
// АКТИВАЦИЯ РАКЕТЫ
// ==================================================

function activateRocket(rocket) {

    // Сначала готовим
    // реальный маршрут
    // и реальную платформу
    // для посадки

    const landingPlatform =
        prepareRocketRoute();

    if (!landingPlatform) {

        console.log(
            '🚀 Не удалось подготовить платформу посадки'
        );

        return;
    }

    rocketActive = true;

    rocketTime = 0;

    activeRocket = rocket;

    rocketLandingPlatform =
        landingPlatform;

    rocketStartY =
        player.y;

    rocketTargetY =
        landingPlatform.y -
        player.height +
        12;

    // Полностью отключаем
    // обычную физику

    velocityY = 0;

    // Даём бонус

    score += 200;

    updateBestScore();

    // Эта ракета больше
    // не активируется повторно

    rocket.active = false;

    // Удаляем монстров
    // рядом с платформой

    obstacles =
        obstacles.filter(function (obstacle) {

            return !isNearRocketLandingPlatform(
                obstacle,
                landingPlatform
            );
        });

    console.log(
        '🚀 РАКЕТА АКТИВИРОВАНА! +200'
    );

    console.log(
        '🚀 Посадочная платформа:',
        landingPlatform.y
    );
}


// ==================================================
// РИСОВАНИЕ РАКЕТЫ
// ==================================================

function drawRocket(rocket) {

    const x = rocket.x;
    const y = rocket.y;

    // Огонь

    ctx.fillStyle = '#ff9f1a';

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        y + 48
    );

    ctx.lineTo(
        x + 22,
        y + 84
    );

    ctx.lineTo(
        x + 36,
        y + 48
    );

    ctx.closePath();

    ctx.fill();

    // Внутренний огонь

    ctx.fillStyle = '#e74c3c';

    ctx.beginPath();

    ctx.moveTo(
        x + 14,
        y + 48
    );

    ctx.lineTo(
        x + 22,
        y + 72
    );

    ctx.lineTo(
        x + 30,
        y + 48
    );

    ctx.closePath();

    ctx.fill();

    // Корпус

    ctx.fillStyle = '#ecf0f1';

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        y + 15
    );

    ctx.lineTo(
        x + 36,
        y + 15
    );

    ctx.lineTo(
        x + 36,
        y + 50
    );

    ctx.lineTo(
        x + 8,
        y + 50
    );

    ctx.closePath();

    ctx.fill();

    // Нос

    ctx.fillStyle = '#e74c3c';

    ctx.beginPath();

    ctx.moveTo(
        x + 22,
        y
    );

    ctx.lineTo(
        x,
        y + 18
    );

    ctx.lineTo(
        x + 44,
        y + 18
    );

    ctx.closePath();

    ctx.fill();

    // Окно

    ctx.fillStyle = '#3498db';

    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 28,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Левое крыло

    ctx.fillStyle = '#95a5a6';

    ctx.beginPath();

    ctx.moveTo(
        x + 8,
        y + 36
    );

    ctx.lineTo(
        x - 8,
        y + 55
    );

    ctx.lineTo(
        x + 12,
        y + 48
    );

    ctx.closePath();

    ctx.fill();

    // Правое крыло

    ctx.beginPath();

    ctx.moveTo(
        x + 36,
        y + 36
    );

    ctx.lineTo(
        x + 52,
        y + 55
    );

    ctx.lineTo(
        x + 32,
        y + 48
    );

    ctx.closePath();

    ctx.fill();
}


// ==================================================
// ПОЛЁТ РАКЕТЫ
// ==================================================

function updateRocketFlight(
    deltaTime,
    currentTime
) {

    if (!rocketActive) {
        return;
    }

    rocketTime +=
        deltaTime * 16.67;

    let progress =
        rocketTime /
        rocketDuration;

    if (progress > 1) {
        progress = 1;
    }

    /*
        Плавная траектория:

        0     = начало
        0.5   = середина
        1     = точка посадки
    */

    const easedProgress =
        progress < 0.5

            ? 2 *
              progress *
              progress

            : 1 -
              Math.pow(
                  -2 * progress + 2,
                  2
              ) /
              2;


    // Движение игрока
    // точно от старта
    // к целевой платформе

    player.y =
        rocketStartY +
        (
            rocketTargetY -
            rocketStartY
        ) *
        easedProgress;


    // Ракета летит
    // вместе с игроком

    if (activeRocket) {

        activeRocket.x =
            player.x +
            player.width / 2 -
            activeRocket.width / 2;

        activeRocket.y =
            player.y -
            activeRocket.height +
            10;
    }


    // Камера

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
            ) *
            0.15;
    }


    // ==================================================
    // ТОЧНАЯ ПОСАДКА
    // ==================================================

    if (progress >= 1) {

        // ПРИНУДИТЕЛЬНО ставим
        // игрока ровно на платформу

        player.y =
            rocketLandingPlatform.y -
            player.height +
            12;


        rocketActive =
            false;


        // Камера остаётся
        // на нужной высоте

        cameraY =
            Math.max(
                0,
                200 -
                player.y
            );


        // Обычный прыжок
        // начинается только сейчас

        velocityY =
            -14;


        // Платформа полностью
        // безопасна некоторое время

        safeRocketPlatform =
            rocketLandingPlatform;

        safeRocketPlatformUntil =
            currentTime + 5000;


        activeRocket =
            null;

        rocketLandingPlatform =
            null;


        rockets =
            rockets.filter(function (item) {

                return item.active;
            });


        console.log(
            '🚀 ПЕРСОНАЖ ТОЧНО ПРИЗЕМЛИЛСЯ НА ПЛАТФОРМУ!'
        );
    }
}


// ==================================================
// BEST SCORE
// ==================================================

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


// ==================================================
// GAME OVER
// ==================================================

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


// ==================================================
// RESTART
// ==================================================

function restartGame() {

    if (restartButton) {
        restartButton.style.display =
            'none';
    }

    player.x = 165;
    player.y = 100;

    velocityY = -14;
    lastTime = 0;

    cameraY = 0;

    score = 0;

    highestPlayerY =
        player.y;


    platforms =
        startPlatforms.map(function (platform) {

            return { ...platform };
        });


    highestPlatformY =
        140;


    platformsLanded =
        0;

    lastLandedPlatform =
        null;


    nextRocketLanding =
        10;

    rocketPending =
        false;


    rockets =
        [];

    rocketActive =
        false;

    activeRocket =
        null;

    rocketTime =
        0;

    rocketLandingPlatform =
        null;

    rocketStartY =
        0;

    rocketTargetY =
        0;


    safeRocketPlatform =
        null;

    safeRocketPlatformUntil =
        0;


    clouds =
        startClouds.map(function (cloud) {

            return { ...cloud };
        });


    highestCloudY =
        500;


    obstacles =
        [];

    lastObstaclePlatformIndex =
        -10;


    gameOver =
        false;

    moveLeft =
        false;

    moveRight =
        false;


    requestAnimationFrame(
        gameLoop
    );
}


// ==================================================
// GAME LOOP
// ==================================================

function gameLoop(currentTime) {

    // --------------------------------------------------
    // DELTA TIME
    // --------------------------------------------------

    if (lastTime === 0) {
        lastTime = currentTime;
    }

    let deltaTime =
        (
            currentTime -
            lastTime
        ) / 16.67;

    lastTime =
        currentTime;


    if (deltaTime > 2) {
        deltaTime = 2;
    }

    if (deltaTime < 0) {
        deltaTime = 0;
    }


    // --------------------------------------------------
    // GAME OVER
    // --------------------------------------------------

    if (gameOver) {

        drawGameOver();

        return;
    }


    // --------------------------------------------------
    // БЕЗОПАСНАЯ ПЛАТФОРМА
    // --------------------------------------------------

    if (
        safeRocketPlatform &&
        safeRocketPlatformUntil !== Infinity &&
        currentTime >
        safeRocketPlatformUntil
    ) {

        safeRocketPlatform =
            null;

        safeRocketPlatformUntil =
            0;
    }


    // --------------------------------------------------
    // ФИЗИКА
    // --------------------------------------------------

    if (rocketActive) {

        updateRocketFlight(
            deltaTime,
            currentTime
        );

    } else {

        velocityY +=
            gravity *
            deltaTime;

        player.y +=
            velocityY *
            deltaTime;
    }


    // --------------------------------------------------
    // ДВИЖЕНИЕ
    // --------------------------------------------------

    if (!rocketActive) {

        if (moveLeft) {

            player.x -=
                6 *
                deltaTime;
        }

        if (moveRight) {

            player.x +=
                6 *
                deltaTime;
        }
    }


    // --------------------------------------------------
    // ГРАНИЦЫ
    // --------------------------------------------------

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


    // --------------------------------------------------
    // КАМЕРА
    // --------------------------------------------------

    if (
        !rocketActive &&
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
                ) *
                0.1;
        }
    }


    // --------------------------------------------------
    // SCORE
    // --------------------------------------------------

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
                    (
                        100 -
                        highestPlayerY
                    ) / 10
                )
            );

        updateBestScore();
    }


    // --------------------------------------------------
    // ГЕНЕРАЦИЯ ПЛАТФОРМ
    // --------------------------------------------------

    if (
        highestPlatformY >
        player.y -
        500
    ) {

        addPlatform();
    }


    // --------------------------------------------------
    // ОБЛАКА
    // --------------------------------------------------

    if (
        highestCloudY >
        player.y -
        900
    ) {

        addCloud();
    }


    // --------------------------------------------------
    // ПРИЗЕМЛЕНИЕ
    // --------------------------------------------------

    if (!rocketActive) {

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

                velocityY =
                    -14;


                if (
                    lastLandedPlatform !==
                    platform
                ) {

                    lastLandedPlatform =
                        platform;

                    platformsLanded++;


                    console.log(
                        'Платформа пройдена:',
                        platformsLanded
                    );


                    // Каждые 10 платформ
                    // запускаем подготовку ракеты

                    if (
                        platformsLanded >=
                        nextRocketLanding
                    ) {

                        rocketPending =
                            true;

                        checkRocketPending();
                    }
                }


                break;
            }
        }
    }


    // --------------------------------------------------
    // ПОМЕХИ
    // --------------------------------------------------

    if (!rocketActive) {

        updateObstacles(
            deltaTime
        );
    }


    // --------------------------------------------------
    // СТОЛКНОВЕНИЕ С ПОМЕХОЙ
    // --------------------------------------------------

    if (!rocketActive) {

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
    }


    // --------------------------------------------------
    // РАКЕТА
    // --------------------------------------------------

    if (!rocketActive) {

        for (
            const rocket
            of rockets
        ) {

            if (
                rocket.active &&
                checkRocketCollision(
                    rocket
                )
            ) {

                activateRocket(
                    rocket
                );

                break;
            }
        }
    }


    // --------------------------------------------------
    // УДАЛЕНИЕ ПРОПУЩЕННЫХ РАКЕТ
    // --------------------------------------------------

    rockets =
        rockets.filter(function (rocket) {

            if (
                rocket ===
                activeRocket
            ) {
                return true;
            }

            const screenY =
                rocket.y +
                cameraY;

            return (
                screenY >
                -150 &&
                screenY <
                canvas.height + 250
            );
        });


    // --------------------------------------------------
    // ПРОВЕРКА ПАДЕНИЯ
    // --------------------------------------------------

    if (!rocketActive) {

        const playerScreenY =
            player.y +
            cameraY;

        const playerScreenBottom =
            playerScreenY +
            player.height;


        if (
            playerScreenBottom >
            canvas.height +
            20
        ) {

            updateBestScore();

            gameOver =
                true;

            drawGameOver();

            return;
        }
    }


    // ==================================================
    // РИСОВАНИЕ
    // ==================================================

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------
    // ФОН
    // --------------------------------------------------

    ctx.fillStyle =
        '#bfe8ff';

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------
    // ОБЛАКА
    // --------------------------------------------------

    for (
        const cloud
        of clouds
    ) {

        drawCloud(
            cloud.x,
            cloud.y +
            cameraY *
            0.3,
            cloud.size
        );
    }


    // --------------------------------------------------
    // SCORE
    // --------------------------------------------------

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


    // --------------------------------------------------
    // BEST
    // --------------------------------------------------

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


    // --------------------------------------------------
    // МОНСТРИКИ
    // --------------------------------------------------

    if (!rocketActive) {

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
    }


    // --------------------------------------------------
    // ПЕРСОНАЖ
    // --------------------------------------------------

    if (
        playerImage.complete &&
        playerImage.naturalWidth > 0
    ) {

        ctx.drawImage(

            playerImage,

            player.x,

            player.y +
            cameraY,

            player.width,
            player.height
        );
    }


    // --------------------------------------------------
    // ПЛАТФОРМЫ
    // --------------------------------------------------

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


    // --------------------------------------------------
    // РАКЕТА
    // ПОВЕРХ ВСЕГО
    // --------------------------------------------------

    if (activeRocket) {

        drawRocket({

            x:
                activeRocket.x,

            y:
                activeRocket.y +
                cameraY,

            width:
                activeRocket.width,

            height:
                activeRocket.height
        });

    } else {

        for (
            const rocket
            of rockets
        ) {

            if (
                rocket.active
            ) {

                drawRocket({

                    x:
                        rocket.x,

                    y:
                        rocket.y +
                        cameraY,

                    width:
                        rocket.width,

                    height:
                        rocket.height
                });
            }
        }
    }


    // --------------------------------------------------
    // NEXT FRAME
    // --------------------------------------------------

    requestAnimationFrame(
        gameLoop
    );
}


// ==================================================
// КЛАВИАТУРА
// ==================================================

document.addEventListener(
    'keydown',
    function (event) {

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
    function (event) {

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


// ==================================================
// ЛЕВАЯ КНОПКА
// ==================================================

const leftButton =
    document.getElementById(
        'leftButton'
    );

if (leftButton) {

    leftButton.addEventListener(
        'pointerdown',
        function (event) {

            event.preventDefault();

            moveLeft = true;
        }
    );

    leftButton.addEventListener(
        'pointerup',
        function (event) {

            event.preventDefault();

            moveLeft = false;
        }
    );

    leftButton.addEventListener(
        'pointerleave',
        function () {

            moveLeft = false;
        }
    );

    leftButton.addEventListener(
        'contextmenu',
        function (event) {

            event.preventDefault();
        }
    );
}


// ==================================================
// ПРАВАЯ КНОПКА
// ==================================================

const rightButton =
    document.getElementById(
        'rightButton'
    );

if (rightButton) {

    rightButton.addEventListener(
        'pointerdown',
        function (event) {

            event.preventDefault();

            moveRight = true;
        }
    );

    rightButton.addEventListener(
        'pointerup',
        function (event) {

            event.preventDefault();

            moveRight = false;
        }
    );

    rightButton.addEventListener(
        'pointerleave',
        function () {

            moveRight = false;
        }
    );

    rightButton.addEventListener(
        'contextmenu',
        function (event) {

            event.preventDefault();
        }
    );
}


// ==================================================
// ЗАПУСК
// ==================================================

requestAnimationFrame(
    gameLoop
);