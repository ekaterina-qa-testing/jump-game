const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


// ==================================================
// КАРТИНКИ
// ==================================================

const playerImage = new Image();
const platformImage = new Image();
const monsterImage = new Image();
const parachuteImage = new Image();

playerImage.src = 'images/player.png';
platformImage.src = 'images/platform.png';
monsterImage.src = 'images/monster.png';
parachuteImage.src = 'images/parachute.png';


// ==================================================
// ЗАГРУЗКА КАРТИНОК
// ==================================================

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

parachuteImage.onload = function () {
    console.log('🪂 Картинка парашюта загрузилась!');
};

parachuteImage.onerror = function () {
    console.log('❌ Ошибка загрузки parachute.png!');
};


// ==================================================
// CANVAS
// ==================================================

canvas.width = 400;
canvas.height = 600;

// Сглаживание картинок
ctx.imageSmoothingEnabled = true;


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


// ==================================================
// МОНСТРЫ
// ==================================================

// Монстр появляется на каждой 25-й
// ФАКТИЧЕСКОЙ обычной платформе

const MONSTER_INTERVAL = 25;

// Первый монстр на платформе №25

const FIRST_MONSTER_PLATFORM = 25;


// Размер монстра

const MONSTER_WIDTH = 35;
const MONSTER_HEIGHT = 35;


// Скорость монстра

const MONSTER_MIN_SPEED = 0.5;
const MONSTER_MAX_SPEED = 0.9;


// ==================================================
// ПАРАШЮТ
// ==================================================

// Парашют каждые 30 приземлений

const PARACHUTE_INTERVAL = 30;


// На сколько платформ вперёд появляется парашют

const PARACHUTE_DISPLAY_OFFSET = 3;


// Сколько платформ вверх летит персонаж

const PARACHUTE_PLATFORMS_UP = 20;


// Продолжительность полёта

const PARACHUTE_DURATION = 6000;


// Сколько платформ после парашюта безопасные

const PARACHUTE_SAFE_PLATFORMS = 20;


// Размер парашюта
// Сохраняем правильное соотношение
// исходной картинки 784 × 1168

const PARACHUTE_WIDTH = 65;
const PARACHUTE_HEIGHT = 97;


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
        isParachuteLanding: false
    },

    {
        x: 50,
        y: 410,
        width: 100,
        height: 20,
        isAlternative: false,
        isParachuteLanding: false
    },

    {
        x: 230,
        y: 320,
        width: 100,
        height: 20,
        isAlternative: false,
        isParachuteLanding: false
    },

    {
        x: 100,
        y: 230,
        width: 100,
        height: 20,
        isAlternative: false,
        isParachuteLanding: false
    },

    {
        x: 200,
        y: 140,
        width: 100,
        height: 20,
        isAlternative: false,
        isParachuteLanding: false
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

let velocityY = -13;

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
// ПАРАШЮТ
// ==================================================

let nextParachuteLanding =
    PARACHUTE_INTERVAL;

let parachutePending = false;

let parachutes = [];

let parachuteActive = false;

let activeParachute = null;

let parachuteTime = 0;

let parachuteStartY = 0;

let parachuteTargetY = 0;

let parachuteLandingPlatform = null;


// ==================================================
// БЕЗОПАСНАЯ ЗОНА ПОСЛЕ ПАРАШЮТА
// ==================================================

let safeParachutePlatformIndex = null;

let safeParachutePlatformY = null;

let parachuteLandingGraceTime = 0;


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
// СОЗДАНИЕ ОБЛАКА
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


// ==================================================
// ДОБАВЛЕНИЕ ОБЛАКА
// ==================================================

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


// ==================================================
// РИСОВАНИЕ ОБЛАКА
// ==================================================

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


// ==================================================
// СОЗДАНИЕ ПЛАТФОРМЫ
// ==================================================

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

    if (
        newX < 0
    ) {

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

        isParachuteLanding: false
    };
}


// ==================================================
// АЛЬТЕРНАТИВНАЯ ПЛАТФОРМА
// ==================================================

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

        isParachuteLanding: false
    };
}


// ==================================================
// БЕЗОПАСНАЯ ЗОНА ПО НОМЕРУ ПЛАТФОРМЫ
// ==================================================

function isInParachuteSafeZone(
    platformIndex
) {

    if (
        safeParachutePlatformIndex === null
    ) {

        return false;
    }

    return (

        platformIndex >=
        safeParachutePlatformIndex &&

        platformIndex <
        safeParachutePlatformIndex +
        PARACHUTE_SAFE_PLATFORMS
    );
}


// ==================================================
// БЕЗОПАСНАЯ ЗОНА ПО Y
// ==================================================

function isPlatformInsideParachuteSafeZone(
    platform
) {

    if (
        safeParachutePlatformY === null
    ) {

        return false;
    }

    const safeTop =
        safeParachutePlatformY -
        (
            PARACHUTE_SAFE_PLATFORMS *
            PLATFORM_GAP
        );

    const safeBottom =
        safeParachutePlatformY +
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

    checkParachutePending();
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

    // Монстры появляются только
    // на 25, 50, 75, 100...

    if (
        platformNumber <
        FIRST_MONSTER_PLATFORM
    ) {

        return false;
    }

    return (
        (
            platformNumber -
            FIRST_MONSTER_PLATFORM
        ) %
        MONSTER_INTERVAL ===
        0
    );
}


// ==================================================
// ПРОВЕРКА: МОЖНО ЛИ СТАВИТЬ МОНСТРА
// ==================================================

function canCreateMonsterHere(
    platformNumber,
    nextPlatform
) {

    if (
        !shouldCreateMonster(
            platformNumber
        )
    ) {

        return false;
    }

    if (
        nextPlatform.isParachuteLanding
    ) {

        return false;
    }

    if (
        isInParachuteSafeZone(
            platformNumber - 1
        )
    ) {

        return false;
    }

    if (
        isPlatformInsideParachuteSafeZone(
            nextPlatform
        )
    ) {

        return false;
    }

    return true;
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
        nextIndex < 0
    ) {

        return;
    }

    /*
        ВАЖНО:

        nextIndex = 0 означает
        первую обычную платформу.

        Поэтому номер платформы =
        nextIndex + 1
    */

    const platformNumber =
        nextIndex + 1;

    if (
        !canCreateMonsterHere(
            platformNumber,
            nextPlatform
        )
    ) {

        return;
    }

    /*
        Нужна предыдущая платформа,
        чтобы разместить монстра
        между двумя платформами.
    */

    if (
        nextIndex < 1
    ) {

        return;
    }

    const currentPlatform =
        normalPlatforms[
            nextIndex - 1
        ];

    if (
        isInParachuteSafeZone(
            nextIndex - 1
        )
    ) {

        return;
    }

    if (
        isPlatformInsideParachuteSafeZone(
            currentPlatform
        )
    ) {

        return;
    }

    createMonsterZone(
        currentPlatform,
        nextPlatform,
        platformNumber
    );
}


// ==================================================
// СОЗДАНИЕ ЗОНЫ МОНСТРИКА
// ==================================================

function createMonsterZone(
    currentPlatform,
    nextPlatform,
    platformNumber
) {

    /*
        Монстр находится между платформами.
    */

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
        ) / 2 -
        MONSTER_HEIGHT / 2;


    /*
        ==================================================
        ГЛАВНАЯ ЛОГИКА РАЗМЕЩЕНИЯ
        ==================================================

        Если следующая платформа слева,
        монстра ставим справа.

        Если следующая платформа справа,
        монстра ставим слева.

        То есть игроку не нужно
        прыгать прямо через монстра
        сразу после отрыва.
    */

    let monsterX;

    const nextCenter =
        nextPlatform.x +
        nextPlatform.width / 2;


    if (
        nextCenter < canvas.width / 2
    ) {

        // Платформа слева
        // Монстр справа

        monsterX =
            canvas.width -
            MONSTER_WIDTH -
            25;

    } else {

        // Платформа справа
        // Монстр слева

        monsterX =
            25;
    }


    /*
        Дополнительная проверка:

        если монстр всё-таки оказался
        слишком близко к платформе,
        двигаем его ещё дальше.
    */

    const monsterCenter =
        monsterX +
        MONSTER_WIDTH / 2;

    const platformCenter =
        nextPlatform.x +
        nextPlatform.width / 2;

    const horizontalDistance =
        Math.abs(
            monsterCenter -
            platformCenter
        );


    if (
        horizontalDistance < 130
    ) {

        if (
            platformCenter < canvas.width / 2
        ) {

            monsterX =
                canvas.width -
                MONSTER_WIDTH -
                10;

        } else {

            monsterX =
                10;
        }
    }


    const obstacle = {

        x: monsterX,

        y: monsterY,

        width: MONSTER_WIDTH,

        height: MONSTER_HEIGHT,

        speed:
            MONSTER_MIN_SPEED +
            Math.random() *
            (
                MONSTER_MAX_SPEED -
                MONSTER_MIN_SPEED
            ),

        direction:
            Math.random() < 0.5
                ? -1
                : 1
    };


    obstacles.push(
        obstacle
    );


    console.log(
        '👾 МОНСТР СОЗДАН НА ПЛАТФОРМЕ №',
        platformNumber
    );


    /*
        ==================================================
        ЗАПАСНАЯ ПЛАТФОРМА
        ==================================================
    */

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
            !isInParachuteSafeZone(
                nextIndexFromNormalPlatform(
                    nextPlatform
                )
            ) &&

            !isPlatformInsideParachuteSafeZone(
                alternativePlatform
            )
        ) {

            platforms.push(
                alternativePlatform
            );

            console.log(
                '🛟 Запасная платформа создана'
            );
        }
    }
}


// ==================================================
// ПОЛУЧЕНИЕ ИНДЕКСА ОБЫЧНОЙ ПЛАТФОРМЫ
// ==================================================

function nextIndexFromNormalPlatform(
    platform
) {

    return getNormalPlatforms().indexOf(
        platform
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
// ==================================================

function isObstacleInsideParachuteSafeZone(
    obstacle
) {

    if (
        safeParachutePlatformY === null
    ) {

        return false;
    }

    const safeTop =
        safeParachutePlatformY -
        (
            PARACHUTE_SAFE_PLATFORMS *
            PLATFORM_GAP
        );

    const safeBottom =
        safeParachutePlatformY +
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

    if (
        parachuteActive
    ) {

        return false;
    }

    if (
        isObstacleInsideParachuteSafeZone(
            obstacle
        )
    ) {

        return false;
    }

    if (
        performance.now() <
        parachuteLandingGraceTime
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
// СОЗДАНИЕ ПЛАТФОРМ ДЛЯ ПАРАШЮТА
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
            Здесь монстрики специально
            НЕ создаются.

            Эти платформы нужны
            для маршрута парашюта.
        */
    }
}


// ==================================================
// ПАРАШЮТ ВПЕРЕДИ
// ==================================================

function createParachuteAhead() {

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
        PARACHUTE_DISPLAY_OFFSET;


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
        displayPlatform.isParachuteLanding
    ) {

        return false;
    }


    const parachute = {

        x:
            displayPlatform.x +
            displayPlatform.width / 2 -
            PARACHUTE_WIDTH / 2,

        y:
            displayPlatform.y -
            PARACHUTE_HEIGHT +
            5,

        width:
            PARACHUTE_WIDTH,

        height:
            PARACHUTE_HEIGHT,

        active: true,

        platform:
            displayPlatform
    };


    parachutes.push(
        parachute
    );


    console.log(
        '🪂 ПАРАШЮТ ПОЯВИЛСЯ ВПЕРЕДИ!'
    );


    return true;
}


// ==================================================
// ПРОВЕРКА ПАРАШЮТА
// ==================================================

function checkParachutePending() {

    if (
        !parachutePending
    ) {

        return;
    }

    if (
        parachuteActive
    ) {

        return;
    }


    const exists =
        parachutes.some(
            function (parachute) {

                return parachute.active;
            }
        );


    if (
        exists
    ) {

        return;
    }


    const created =
        createParachuteAhead();


    if (
        created
    ) {

        parachutePending =
            false;

        nextParachuteLanding +=
            PARACHUTE_INTERVAL;


        console.log(
            '🪂 Следующий парашют после:',
            nextParachuteLanding
        );
    }
}


// ==================================================
// ПОДГОТОВКА ПОСАДКИ ПАРАШЮТА
// ==================================================

function prepareParachuteLanding() {

    if (
        !activeParachute ||
        !activeParachute.platform
    ) {

        return null;
    }


    const normalPlatforms =
        getNormalPlatforms();


    const parachutePlatformIndex =
        normalPlatforms.indexOf(
            activeParachute.platform
        );


    if (
        parachutePlatformIndex < 0
    ) {

        return null;
    }


    const targetIndex =
        parachutePlatformIndex +
        PARACHUTE_PLATFORMS_UP;


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


    landingPlatform.isParachuteLanding =
        true;


    safeParachutePlatformIndex =
        targetIndex;


    safeParachutePlatformY =
        landingPlatform.y;


    obstacles =
        obstacles.filter(
            function (obstacle) {

                return !isObstacleInsideParachuteSafeZone(
                    obstacle
                );
            }
        );


    return landingPlatform;
}


// ==================================================
// СТОЛКНОВЕНИЕ С ПАРАШЮТОМ
// ==================================================

function checkParachuteCollision(
    parachute
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
        parachute.x &&

        playerLeft <
        parachute.x +
        parachute.width &&

        playerBottom >
        parachute.y &&

        playerTop <
        parachute.y +
        parachute.height
    );
}


// ==================================================
// АКТИВАЦИЯ ПАРАШЮТА
// ==================================================

function activateParachute(
    parachute
) {

    activeParachute =
        parachute;


    const landingPlatform =
        prepareParachuteLanding();


    if (
        !landingPlatform
    ) {

        activeParachute =
            null;

        return;
    }


    parachuteActive =
        true;


    parachuteTime =
        0;


    parachuteStartY =
        player.y;


    parachuteLandingPlatform =
        landingPlatform;


    parachuteTargetY =
        landingPlatform.y -
        player.height +
        12;


    velocityY =
        0;


    score +=
        200;


    updateBestScore();


    parachute.active =
        false;


    obstacles =
        obstacles.filter(
            function (obstacle) {

                return !isObstacleInsideParachuteSafeZone(
                    obstacle
                );
            }
        );


    console.log(
        '🪂 ПАРАШЮТ АКТИВИРОВАН! +200'
    );


    console.log(
        '🪂 Посадка на платформу №',
        safeParachutePlatformIndex + 1
    );
}


// ==================================================
// РИСОВАНИЕ ПАРАШЮТА
// ==================================================

function drawParachute(
    parachute
) {

    if (
        parachuteImage.complete &&
        parachuteImage.naturalWidth > 0
    ) {

        ctx.imageSmoothingEnabled = true;

        ctx.drawImage(

            parachuteImage,

            parachute.x,

            parachute.y,

            parachute.width,

            parachute.height
        );
    }
}


// ==================================================
// ПОЛЁТ НА ПАРАШЮТЕ
// ==================================================

function updateParachuteFlight(
    deltaTime,
    currentTime
) {

    if (
        !parachuteActive
    ) {

        return;
    }


    parachuteTime +=
        deltaTime *
        16.67;


    let progress =
        parachuteTime /
        PARACHUTE_DURATION;


    if (
        progress > 1
    ) {

        progress =
            1;
    }


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


    player.y =
        parachuteStartY +
        (
            parachuteTargetY -
            parachuteStartY
        ) *
        smoothProgress;


    if (
        activeParachute
    ) {

        activeParachute.x =
            player.x +
            player.width / 2 -
            activeParachute.width / 2;


        activeParachute.y =
            player.y -
            activeParachute.height +
            15;
    }


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


    if (
        progress >= 1
    ) {

        player.y =
            parachuteLandingPlatform.y -
            player.height +
            12;


        parachuteActive =
            false;


        cameraY =
            Math.max(
                0,
                200 -
                player.y
            );


        velocityY =
            -13;


        safeParachutePlatformY =
            parachuteLandingPlatform.y;


        safeParachutePlatformIndex =
            getNormalPlatforms().indexOf(
                parachuteLandingPlatform
            );


        parachuteLandingGraceTime =
            performance.now() +
            2000;


        obstacles =
            obstacles.filter(
                function (obstacle) {

                    return !isObstacleInsideParachuteSafeZone(
                        obstacle
                    );
                }
            );


        activeParachute =
            null;


        parachuteLandingPlatform =
            null;


        parachuteTime =
            0;


        parachutes =
            parachutes.filter(
                function (parachute) {

                    return parachute.active;
                }
            );


        /*
            ВАЖНО:

            После посадки разрешаем
            обычный повторный прыжок
            с этой же платформы.
        */

        lastLandedPlatform =
            parachuteLandingPlatform;


        console.log(
            '🪂 ПЕРСОНАЖ ПРИЗЕМЛИЛСЯ НА БЕЗОПАСНУЮ ПЛАТФОРМУ'
        );


        console.log(
            '🛡️ Следующие',
            PARACHUTE_SAFE_PLATFORMS,
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
        -13;


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


    nextParachuteLanding =
        PARACHUTE_INTERVAL;


    parachutePending =
        false;


    parachutes =
        [];


    parachuteActive =
        false;


    activeParachute =
        null;


    parachuteTime =
        0;


    parachuteStartY =
        0;


    parachuteTargetY =
        0;


    parachuteLandingPlatform =
        null;


    safeParachutePlatformIndex =
        null;


    safeParachutePlatformY =
        null;


    parachuteLandingGraceTime =
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
        parachuteActive
    ) {

        updateParachuteFlight(
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
        !parachuteActive
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
        !parachuteActive &&
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
        !parachuteActive
    ) {

        for (
            const platform
            of platforms
        ) {

            const playerBottom =
                player.y +
                player.height -
                12;


            /*
                ВАЖНО:

                Здесь НЕ проверяем
                lastLandedPlatform.

                Поэтому на одну и ту же
                платформу можно приземлиться
                снова.
            */

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
                    -13;


                /*
                    Считаем платформу
                    только один раз подряд.

                    Это нужно для системы
                    парашютов.

                    Но сама посадка
                    происходит каждый раз.
                */

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


                    // ==================================================
                    // ПАРАШЮТ КАЖДЫЕ 30 ПРИЗЕМЛЕНИЙ
                    // ==================================================

                    if (
                        platformsLanded >=
                        nextParachuteLanding
                    ) {

                        parachutePending =
                            true;
                    }
                }


                break;
            }
        }
    }


    // ==================================================
    // СОЗДАНИЕ ПАРАШЮТА
    // ==================================================

    if (
        !parachuteActive &&
        parachutePending
    ) {

        const created =
            createParachuteAhead();


        if (
            created
        ) {

            parachutePending =
                false;


            nextParachuteLanding +=
                PARACHUTE_INTERVAL;


            console.log(
                '🪂 Следующий парашют после:',
                nextParachuteLanding
            );
        }
    }


    // ==================================================
    // ДВИЖЕНИЕ МОНСТРОВ
    // ==================================================

    if (
        !parachuteActive
    ) {

        updateObstacles(
            deltaTime
        );
    }


    // ==================================================
    // СТОЛКНОВЕНИЕ С МОНСТРИКОМ
    // ==================================================

    if (
        !parachuteActive
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
    // СТОЛКНОВЕНИЕ С ПАРАШЮТОМ
    // ==================================================

    if (
        !parachuteActive
    ) {

        for (
            const parachute
            of parachutes
        ) {

            if (
                parachute.active &&
                checkParachuteCollision(
                    parachute
                )
            ) {

                activateParachute(
                    parachute
                );

                break;
            }
        }
    }


    // ==================================================
    // УДАЛЕНИЕ ДАЛЁКИХ ПАРАШЮТОВ
    // ==================================================

    parachutes =
        parachutes.filter(
            function (parachute) {

                if (
                    parachute ===
                    activeParachute
                ) {

                    return true;
                }


                const screenY =
                    parachute.y +
                    cameraY;


                return (

                    screenY >
                    -200 &&

                    screenY <
                    canvas.height +
                    300
                );
            }
        );


    // ==================================================
    // ПРОВЕРКА ПАДЕНИЯ
    // ==================================================

    if (
        !parachuteActive
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
        !parachuteActive
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
    // ПАРАШЮТЫ
    // ==================================================

    if (
        activeParachute
    ) {

        drawParachute({

            x:
                activeParachute.x,

            y:
                activeParachute.y +
                cameraY,

            width:
                activeParachute.width,

            height:
                activeParachute.height
        });

    } else {

        for (
            const parachute
            of parachutes
        ) {

            if (
                parachute.active
            ) {

                drawParachute({

                    x:
                        parachute.x,

                    y:
                        parachute.y +
                        cameraY,

                    width:
                        parachute.width,

                    height:
                        parachute.height
                });
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