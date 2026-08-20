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

let restartButton =
    document.getElementById('restartButton');

if (!restartButton) {

    restartButton =
        document.createElement('button');

    restartButton.id =
        'restartButton';

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
    restartButton.style.position = 'fixed';
    restartButton.style.left = '50%';
    restartButton.style.transform =
        'translateX(-50%)';
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

    restartButton.style.touchAction =
        'manipulation';

    restartButton.addEventListener(
        'pointerdown',
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            restartGame();
        }
    );

    restartButton.addEventListener(
        'contextmenu',
        function (event) {

            event.preventDefault();
        }
    );
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
// НАСТРОЙКИ
// ==================================================

const PLATFORM_GAP = 90;

const FIRST_MONSTER_PLATFORM = 21;

const MONSTER_INTERVAL = 20;

const MONSTER_CHANCE = 0.65;

const ROCKET_INTERVAL = 10;

const ROCKET_PLATFORMS_UP = 20;

const ROCKET_DISPLAY_OFFSET = 3;

const ROCKET_DURATION = 6000;

const ROCKET_SAFE_PLATFORMS = 20;


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


let platforms =
    startPlatforms.map(function (platform) {

        return {
            ...platform
        };
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

let highestPlayerY =
    player.y;

let bestScore =
    Number(
        localStorage.getItem('bestScore')
    ) || 0;


// ==================================================
// ПРИЗЕМЛЕНИЯ
// ==================================================

let platformsLanded = 0;

let lastLandedPlatform = null;


// ==================================================
// РАКЕТА
// ==================================================

let nextRocketLanding =
    ROCKET_INTERVAL;

let rocketPending = false;

let rockets = [];

let rocketActive = false;

let activeRocket = null;

let rocketTime = 0;

let rocketStartY = 0;

let rocketTargetY = 0;

let rocketLandingPlatform = null;


// ==================================================
// БЕЗОПАСНАЯ ЗОНА ПОСЛЕ РАКЕТЫ
// ==================================================

let safeRocketPlatformIndex = null;

let safeRocketPlatformY = null;

let rocketLandingGraceTime = 0;


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


let clouds =
    startClouds.map(function (cloud) {

        return {
            ...cloud
        };
    });


let highestCloudY = 500;


// ==================================================
// ОБЛАКА
// ==================================================

function createCloud(y) {

    return {

        x:
            Math.random() * 330,

        y: y,

        size:
            0.8 +
            Math.random() * 0.6
    };
}


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


// ==================================================
// ПЛАТФОРМЫ
// ==================================================

function getNormalPlatforms() {

    return platforms.filter(
        function (platform) {

            return !platform.isAlternative;
        }
    );
}


function createPlatform(y) {

    const normalPlatforms =
        getNormalPlatforms();


    const previousPlatform =
        normalPlatforms[
            normalPlatforms.length - 1
        ];


    const direction =
        Math.random() < 0.5
            ? -1
            : 1;


    const distance =
        70 +
        Math.random() * 50;


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

        height: 20,

        isAlternative: false,

        isRocketLanding: false
    };
}


function createAlternativePlatform(
    mainPlatform
) {

    let newX;


    if (
        mainPlatform.x >= 200
    ) {

        newX =
            Math.max(
                0,
                mainPlatform.x - 150
            );

    } else {

        newX =
            Math.min(
                canvas.width - 100,
                mainPlatform.x + 150
            );
    }


    return {

        x: newX,

        y: mainPlatform.y,

        width: 100,

        height: 20,

        isAlternative: true,

        isRocketLanding: false
    };
}


// ==================================================
// БЕЗОПАСНАЯ ЗОНА РАКЕТЫ
// ПО НОМЕРУ ПЛАТФОРМЫ
// ==================================================

function isInRocketSafeZone(
    platformIndex
) {

    if (
        safeRocketPlatformIndex === null
    ) {

        return false;
    }


    return (

        platformIndex >=
        safeRocketPlatformIndex &&

        platformIndex <
        safeRocketPlatformIndex +
        ROCKET_SAFE_PLATFORMS
    );
}


// ==================================================
// БЕЗОПАСНАЯ ЗОНА РАКЕТЫ
// ПО Y-КООРДИНАТЕ
// ==================================================

function isPlatformInsideRocketSafeZone(
    platform
) {

    if (
        safeRocketPlatformY === null
    ) {

        return false;
    }


    const safeTop =
        safeRocketPlatformY -
        (
            ROCKET_SAFE_PLATFORMS *
            PLATFORM_GAP
        );


    const safeBottom =
        safeRocketPlatformY +
        120;


    return (

        platform.y >= safeTop &&

        platform.y <= safeBottom
    );
}


// ==================================================
// ДОБАВЛЕНИЕ ПЛАТФОРМЫ
// ==================================================

function addPlatform() {

    highestPlatformY -=
        PLATFORM_GAP;


    const newPlatform =
        createPlatform(
            highestPlatformY
        );


    platforms.push(
        newPlatform
    );


    setupMonsterZone(
        newPlatform
    );


    checkRocketPending();
}


// ==================================================
// МОНСТРИКИ
// ==================================================

let obstacles = [];


// ==================================================
// НУЖЕН ЛИ МОНСТРИК
// ==================================================

function shouldCreateMonster(
    platformNumber
) {

    // Первые 20 платформ

    if (
        platformNumber <= 20
    ) {

        return false;
    }


    // 21, 41, 61, 81...

    const monsterPlatform =
        (
            platformNumber -
            FIRST_MONSTER_PLATFORM
        ) %
        MONSTER_INTERVAL ===
        0;


    if (
        !monsterPlatform
    ) {

        return false;
    }


    return (
        Math.random() <=
        MONSTER_CHANCE
    );
}


// ==================================================
// ПОДГОТОВКА ЗОНЫ МОНСТРИКА
// ==================================================

function setupMonsterZone(
    nextPlatform
) {

    const normalPlatforms =
        getNormalPlatforms();


    const nextIndex =
        normalPlatforms.indexOf(
            nextPlatform
        );


    if (
        nextIndex < 1
    ) {

        return;
    }


    const platformNumber =
        nextIndex + 1;


    // Первые 20

    if (
        platformNumber <= 20
    ) {

        return;
    }


    // После ракеты
    // 20 платформ безопасности

    if (
        isInRocketSafeZone(
            nextIndex
        )
    ) {

        return;
    }


    // Дополнительная защита
    // по координате

    if (
        isPlatformInsideRocketSafeZone(
            nextPlatform
        )
    ) {

        return;
    }


    // Ракетная платформа

    if (
        nextPlatform.isRocketLanding
    ) {

        return;
    }


    if (
        !shouldCreateMonster(
            platformNumber
        )
    ) {

        return;
    }


    const currentPlatform =
        normalPlatforms[
            nextIndex - 1
        ];


    if (
        isInRocketSafeZone(
            nextIndex - 1
        )
    ) {

        return;
    }


    if (
        isPlatformInsideRocketSafeZone(
            currentPlatform
        )
    ) {

        return;
    }


    createMonsterZone(
        currentPlatform,
        nextPlatform
    );
}


// ==================================================
// СОЗДАНИЕ ЗОНЫ МОНСТРИКА
// ==================================================

function createMonsterZone(
    currentPlatform,
    nextPlatform
) {

    const normalPlatforms =
        getNormalPlatforms();


    const nextIndex =
        normalPlatforms.indexOf(
            nextPlatform
        );


    if (
        nextIndex < 0
    ) {

        return;
    }


    // ----------------------------------------------
    // МОНСТРИК МЕЖДУ ПЛАТФОРМАМИ
    // ----------------------------------------------

    const gapTop =
        nextPlatform.y +
        nextPlatform.height;


    const gapBottom =
        currentPlatform.y;


    const monsterY =
        gapTop +
        (
            gapBottom -
            gapTop
        ) /
        2 -
        18;


    let monsterX;


    if (
        nextPlatform.x < 200
    ) {

        monsterX =
            Math.min(
                canvas.width - 35,
                nextPlatform.x + 125
            );

    } else {

        monsterX =
            Math.max(
                0,
                nextPlatform.x - 90
            );
    }


    // ----------------------------------------------
    // МЕДЛЕННЫЙ МОНСТРИК
    // ----------------------------------------------

    const obstacle = {

        x: monsterX,

        y: monsterY,

        width: 35,

        height: 35,

        speed:
            0.8 +
            Math.random() * 0.6,

        direction:
            Math.random() < 0.5
                ? -1
                : 1
    };


    obstacles.push(
        obstacle
    );


    // ----------------------------------------------
    // ЗАПАСНАЯ ПЛАТФОРМА
    // ----------------------------------------------

    const alternativePlatform =
        createAlternativePlatform(
            nextPlatform
        );


    const alternativeDistance =
        Math.abs(
            alternativePlatform.x -
            nextPlatform.x
        );


    if (
        alternativeDistance >= 80
    ) {

        if (
            !isInRocketSafeZone(
                nextIndex
            ) &&
            !isPlatformInsideRocketSafeZone(
                alternativePlatform
            )
        ) {

            platforms.push(
                alternativePlatform
            );
        }
    }


    console.log(
        '👾 Монстрик на платформе:',
        nextIndex + 1
    );

    console.log(
        '🛟 Запасная платформа создана'
    );
}


// ==================================================
// ДВИЖЕНИЕ МОНСТРИКОВ
// ==================================================

function updateObstacles(
    deltaTime
) {

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

            obstacle.direction *=
                -1;
        }
    }
}


// ==================================================
// МОНСТРИК В БЕЗОПАСНОЙ ЗОНЕ
// ПО Y
// ==================================================

function isObstacleInsideRocketSafeZone(
    obstacle
) {

    if (
        safeRocketPlatformY === null
    ) {

        return false;
    }


    const safeTop =
        safeRocketPlatformY -
        (
            ROCKET_SAFE_PLATFORMS *
            PLATFORM_GAP
        );


    const safeBottom =
        safeRocketPlatformY +
        120;


    const obstacleCenterY =
        obstacle.y +
        obstacle.height / 2;


    return (

        obstacleCenterY >=
        safeTop &&

        obstacleCenterY <=
        safeBottom
    );
}


// ==================================================
// СТОЛКНОВЕНИЕ С МОНСТРИКОМ
// ==================================================

function checkObstacleCollision(
    obstacle
) {

    // Полная безопасность
    // после ракеты

    if (
        isObstacleInsideRocketSafeZone(
            obstacle
        )
    ) {

        return false;
    }


    // Короткая неуязвимость
    // после посадки

    if (
        performance.now() <
        rocketLandingGraceTime
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


// ==================================================
// СОЗДАНИЕ ПЛАТФОРМ ДЛЯ РАКЕТЫ
// ==================================================

function ensureNormalPlatforms(
    countNeeded
) {

    while (
        getNormalPlatforms().length <
        countNeeded
    ) {

        highestPlatformY -=
            PLATFORM_GAP;


        const newPlatform =
            createPlatform(
                highestPlatformY
            );


        platforms.push(
            newPlatform
        );

        /*
            Здесь монстрики
            специально не создаются.

            Эти платформы нужны
            для маршрута ракеты.
        */
    }
}


// ==================================================
// РАКЕТА ВПЕРЕДИ
// ==================================================

function createRocketAhead() {

    if (
        !lastLandedPlatform
    ) {

        return false;
    }


    const normalPlatforms =
        getNormalPlatforms();


    const currentIndex =
        normalPlatforms.indexOf(
            lastLandedPlatform
        );


    if (
        currentIndex < 0
    ) {

        return false;
    }


    const displayIndex =
        currentIndex +
        ROCKET_DISPLAY_OFFSET;


    ensureNormalPlatforms(
        displayIndex + 1
    );


    const updatedPlatforms =
        getNormalPlatforms();


    const displayPlatform =
        updatedPlatforms[
            displayIndex
        ];


    if (
        !displayPlatform
    ) {

        return false;
    }


    if (
        displayPlatform.isRocketLanding
    ) {

        return false;
    }


    const rocket = {

        x:
            displayPlatform.x +
            displayPlatform.width / 2 -
            22,

        y:
            displayPlatform.y -
            72,

        width: 44,

        height: 65,

        active: true,

        platform:
            displayPlatform
    };


    rockets.push(
        rocket
    );


    console.log(
        '🚀 РАКЕТА ПОЯВИЛАСЬ ВПЕРЕДИ!'
    );


    return true;
}


// ==================================================
// ПРОВЕРКА РАКЕТЫ
// ==================================================

function checkRocketPending() {

    if (
        !rocketPending
    ) {

        return;
    }


    if (
        rocketActive
    ) {

        return;
    }


    const exists =
        rockets.some(
            function (rocket) {

                return rocket.active;
            }
        );


    if (
        exists
    ) {

        return;
    }


    const created =
        createRocketAhead();


    if (
        created
    ) {

        rocketPending =
            false;


        nextRocketLanding +=
            ROCKET_INTERVAL;


        console.log(
            '🚀 Следующая ракета после:',
            nextRocketLanding
        );
    }
}


// ==================================================
// ПОДГОТОВКА ПОСАДКИ РАКЕТЫ
// ==================================================

function prepareRocketLanding() {

    if (
        !activeRocket ||
        !activeRocket.platform
    ) {

        return null;
    }


    const normalPlatforms =
        getNormalPlatforms();


    const rocketPlatformIndex =
        normalPlatforms.indexOf(
            activeRocket.platform
        );


    if (
        rocketPlatformIndex < 0
    ) {

        return null;
    }


    const targetIndex =
        rocketPlatformIndex +
        ROCKET_PLATFORMS_UP;


    ensureNormalPlatforms(
        targetIndex + 1
    );


    const updatedPlatforms =
        getNormalPlatforms();


    const landingPlatform =
        updatedPlatforms[
            targetIndex
        ];


    if (
        !landingPlatform
    ) {

        return null;
    }


    // ----------------------------------------------
    // РАКЕТНАЯ ПЛАТФОРМА
    // ----------------------------------------------

    landingPlatform.isRocketLanding =
        true;


    // ----------------------------------------------
    // СОХРАНЯЕМ ИНДЕКС
    // ----------------------------------------------

    safeRocketPlatformIndex =
        targetIndex;


    // ----------------------------------------------
    // СОХРАНЯЕМ Y
    // ----------------------------------------------

    safeRocketPlatformY =
        landingPlatform.y;


    // ----------------------------------------------
    // УДАЛЯЕМ ВСЕ МОНСТРЫ
    // В БЕЗОПАСНОЙ ЗОНЕ
    // ----------------------------------------------

    obstacles =
        obstacles.filter(
            function (obstacle) {

                return !isObstacleInsideRocketSafeZone(
                    obstacle
                );
            }
        );


    return landingPlatform;
}


// ==================================================
// COLLISION РАКЕТЫ
// ==================================================

function checkRocketCollision(
    rocket
) {

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

        playerRight >
        rocket.x &&

        playerLeft <
        rocket.x +
        rocket.width &&

        playerBottom >
        rocket.y &&

        playerTop <
        rocket.y +
        rocket.height
    );
}


// ==================================================
// АКТИВАЦИЯ РАКЕТЫ
// ==================================================

function activateRocket(
    rocket
) {

    activeRocket =
        rocket;


    const landingPlatform =
        prepareRocketLanding();


    if (
        !landingPlatform
    ) {

        activeRocket =
            null;

        return;
    }


    rocketActive =
        true;


    rocketTime =
        0;


    rocketStartY =
        player.y;


    rocketLandingPlatform =
        landingPlatform;


    rocketTargetY =
        landingPlatform.y -
        player.height +
        12;


    velocityY =
        0;


    score +=
        200;


    updateBestScore();


    // Нельзя активировать
    // повторно

    rocket.active =
        false;


    // Ещё раз чистим
    // безопасную зону

    obstacles =
        obstacles.filter(
            function (obstacle) {

                return !isObstacleInsideRocketSafeZone(
                    obstacle
                );
            }
        );


    console.log(
        '🚀 РАКЕТА АКТИВИРОВАНА! +200'
    );


    console.log(
        '🚀 Посадка на платформу №',
        safeRocketPlatformIndex + 1
    );
}


// ==================================================
// РИСОВАНИЕ РАКЕТЫ
// ==================================================

function drawRocket(
    rocket
) {

    const x =
        rocket.x;


    const y =
        rocket.y;


    // Огонь

    ctx.fillStyle =
        '#ff9f1a';


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


    // Красная часть огня

    ctx.fillStyle =
        '#e74c3c';


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

    ctx.fillStyle =
        '#ecf0f1';


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

    ctx.fillStyle =
        '#e74c3c';


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

    ctx.fillStyle =
        '#3498db';


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

    ctx.fillStyle =
        '#95a5a6';


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

    if (
        !rocketActive
    ) {

        return;
    }


    rocketTime +=
        deltaTime *
        16.67;


    let progress =
        rocketTime /
        ROCKET_DURATION;


    if (
        progress > 1
    ) {

        progress =
            1;
    }


    // Плавная траектория

    const smoothProgress =
        progress < 0.5

            ?

            2 *
            progress *
            progress

            :

            1 -
            Math.pow(
                -2 * progress + 2,
                2
            ) /
            2;


    // Игрок движется
    // от старта к конкретной
    // платформе посадки

    player.y =
        rocketStartY +
        (
            rocketTargetY -
            rocketStartY
        ) *
        smoothProgress;


    // Ракета следует за игроком

    if (
        activeRocket
    ) {

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
    // ПОСАДКА
    // ==================================================

    if (
        progress >= 1
    ) {

        // ТОЧНАЯ ПОСАДКА

        player.y =
            rocketLandingPlatform.y -
            player.height +
            12;


        rocketActive =
            false;


        cameraY =
            Math.max(
                0,
                200 -
                player.y
            );


        // Новый обычный прыжок

        velocityY =
            -14;


        // ----------------------------------------------
        // БЕЗОПАСНАЯ ЗОНА
        // ----------------------------------------------

        safeRocketPlatformY =
            rocketLandingPlatform.y;


        safeRocketPlatformIndex =
            getNormalPlatforms().indexOf(
                rocketLandingPlatform
            );


        // ----------------------------------------------
        // 2 СЕКУНДЫ НЕУЯЗВИМОСТИ
        // ----------------------------------------------

        rocketLandingGraceTime =
            performance.now() +
            2000;


        // ----------------------------------------------
        // УДАЛЯЕМ СУЩЕСТВУЮЩИХ
        // МОНСТРОВ В БЕЗОПАСНОЙ ЗОНЕ
        // ----------------------------------------------

        obstacles =
            obstacles.filter(
                function (obstacle) {

                    return !isObstacleInsideRocketSafeZone(
                        obstacle
                    );
                }
            );


        activeRocket =
            null;


        rocketLandingPlatform =
            null;


        rocketTime =
            0;


        rockets =
            rockets.filter(
                function (rocket) {

                    return rocket.active;
                }
            );


        console.log(
            '🚀 ПЕРСОНАЖ ПРИЗЕМЛИЛСЯ НА БЕЗОПАСНУЮ ПЛАТФОРМУ'
        );


        console.log(
            '🛡️ Следующие',
            ROCKET_SAFE_PLATFORMS,
            'платформ без монстров'
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
        'SCORE: ' +
        score,
        canvas.width / 2,
        275
    );


    ctx.fillText(
        'BEST: ' +
        bestScore,
        canvas.width / 2,
        310
    );


    ctx.textAlign =
        'left';


    if (
        restartButton
    ) {

        restartButton.style.display =
            'block';
    }
}


// ==================================================
// RESTART
// ==================================================

function restartGame() {

    if (
        restartButton
    ) {

        restartButton.style.display =
            'none';
    }


    player.x =
        165;

    player.y =
        100;


    velocityY =
        -14;

    lastTime =
        0;


    cameraY =
        0;


    score =
        0;


    highestPlayerY =
        player.y;


    platforms =
        startPlatforms.map(
            function (platform) {

                return {
                    ...platform
                };
            }
        );


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


    rocketStartY =
        0;


    rocketTargetY =
        0;


    rocketLandingPlatform =
        null;


    safeRocketPlatformIndex =
        null;


    safeRocketPlatformY =
        null;


    rocketLandingGraceTime =
        0;


    clouds =
        startClouds.map(
            function (cloud) {

                return {
                    ...cloud
                };
            }
        );


    highestCloudY =
        500;


    obstacles =
        [];


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

function gameLoop(
    currentTime
) {

    // ==================================================
    // DELTA TIME
    // ==================================================

    if (
        lastTime === 0
    ) {

        lastTime =
            currentTime;
    }


    let deltaTime =
        (
            currentTime -
            lastTime
        ) /
        16.67;


    lastTime =
        currentTime;


    if (
        deltaTime > 2
    ) {

        deltaTime =
            2;
    }


    if (
        deltaTime < 0
    ) {

        deltaTime =
            0;
    }


    // ==================================================
    // GAME OVER
    // ==================================================

    if (
        gameOver
    ) {

        drawGameOver();

        return;
    }


    // ==================================================
    // ФИЗИКА
    // ==================================================

    if (
        rocketActive
    ) {

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


    // ==================================================
    // ДВИЖЕНИЕ
    // ==================================================

    if (
        !rocketActive
    ) {

        if (
            moveLeft
        ) {

            player.x -=
                6 *
                deltaTime;
        }


        if (
            moveRight
        ) {

            player.x +=
                6 *
                deltaTime;
        }
    }


    // ==================================================
    // ГРАНИЦЫ
    // ==================================================

    if (
        player.x < 0
    ) {

        player.x =
            0;
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


    // ==================================================
    // КАМЕРА
    // ==================================================

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


    // ==================================================
    // SCORE
    // ==================================================

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
                    ) /
                    10
                )
            );


        updateBestScore();
    }


    // ==================================================
    // НОВЫЕ ПЛАТФОРМЫ
    // ==================================================

    if (
        highestPlatformY >
        player.y -
        500
    ) {

        addPlatform();
    }


    // ==================================================
    // НОВЫЕ ОБЛАКА
    // ==================================================

    if (
        highestCloudY >
        player.y -
        900
    ) {

        addCloud();
    }


    // ==================================================
    // ПРИЗЕМЛЕНИЕ
    // ==================================================

    if (
        !rocketActive
    ) {

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


                    // Ракета каждые 10

                    if (
                        platformsLanded >=
                        nextRocketLanding
                    ) {

                        rocketPending =
                            true;
                    }
                }


                break;
            }
        }
    }


    // ==================================================
    // СОЗДАНИЕ РАКЕТЫ
    // ==================================================

    if (
        !rocketActive &&
        rocketPending
    ) {

        const created =
            createRocketAhead();


        if (
            created
        ) {

            rocketPending =
                false;


            nextRocketLanding +=
                ROCKET_INTERVAL;


            console.log(
                '🚀 Следующая ракета после:',
                nextRocketLanding
            );
        }
    }


    // ==================================================
    // ДВИЖЕНИЕ МОНСТРОВ
    // ==================================================

    if (
        !rocketActive
    ) {

        updateObstacles(
            deltaTime
        );
    }


    // ==================================================
    // СТОЛКНОВЕНИЕ С МОНСТРИКОМ
    // ==================================================

    if (
        !rocketActive
    ) {

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


    // ==================================================
    // СТОЛКНОВЕНИЕ С РАКЕТОЙ
    // ==================================================

    if (
        !rocketActive
    ) {

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


    // ==================================================
    // УДАЛЕНИЕ ДАЛЁКИХ РАКЕТ
    // ==================================================

    rockets =
        rockets.filter(
            function (rocket) {

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
                    canvas.height +
                    250
                );
            }
        );


    // ==================================================
    // ПРОВЕРКА ПАДЕНИЯ
    // ==================================================

    if (
        !rocketActive
    ) {

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


    // ==================================================
    // НЕБО
    // ==================================================

    ctx.fillStyle =
        '#bfe8ff';


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ==================================================
    // ОБЛАКА
    // ==================================================

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


    // ==================================================
    // SCORE
    // ==================================================

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


    // ==================================================
    // BEST
    // ==================================================

    ctx.textAlign =
        'right';


    ctx.fillText(
        'BEST: ' +
        bestScore,

        canvas.width -
        15,

        35
    );


    ctx.textAlign =
        'left';


    // ==================================================
    // МОНСТРИКИ
    // ==================================================

    if (
        !rocketActive
    ) {

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


    // ==================================================
    // ПЕРСОНАЖ
    // ==================================================

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


    // ==================================================
    // ПЛАТФОРМЫ
    // ==================================================

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


    // ==================================================
    // РАКЕТА
    // ==================================================

    if (
        activeRocket
    ) {

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


    // ==================================================
    // NEXT FRAME
    // ==================================================

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

            moveLeft =
                true;
        }


        if (
            event.key ===
            'ArrowRight'
        ) {

            moveRight =
                true;
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

            moveLeft =
                false;
        }


        if (
            event.key ===
            'ArrowRight'
        ) {

            moveRight =
                false;
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


if (
    leftButton
) {

    leftButton.addEventListener(
        'pointerdown',
        function (event) {

            event.preventDefault();

            moveLeft =
                true;
        }
    );


    leftButton.addEventListener(
        'pointerup',
        function (event) {

            event.preventDefault();

            moveLeft =
                false;
        }
    );


    leftButton.addEventListener(
        'pointerleave',
        function () {

            moveLeft =
                false;
        }
    );


    leftButton.addEventListener(
        'pointercancel',
        function () {

            moveLeft =
                false;
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


if (
    rightButton
) {

    rightButton.addEventListener(
        'pointerdown',
        function (event) {

            event.preventDefault();

            moveRight =
                true;
        }
    );


    rightButton.addEventListener(
        'pointerup',
        function (event) {

            event.preventDefault();

            moveRight =
                false;
        }
    );


    rightButton.addEventListener(
        'pointerleave',
        function () {

            moveRight =
                false;
        }
    );


    rightButton.addEventListener(
        'pointercancel',
        function () {

            moveRight =
                false;
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