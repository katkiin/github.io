```javascript
console.log("SCRIPT LOADED");


/* ==================================================
   GAME SESSION TRACKING
================================================== */

const API_URL =
    "https://berry-cake-api.sak089536.workers.dev/log";

let gameStartTime = null;
let gameAttempt = 0;


/* ==================================================
   START GAME SESSION
================================================== */

function startGameSession() {

    gameStartTime = new Date();

    gameAttempt++;

}


/* ==================================================
   SEND GAME SESSION
================================================== */

async function sendGameSession() {

    if (!gameStartTime) {
        return;
    }

    const completedAt = new Date();

    const timeSeconds =
        (completedAt - gameStartTime) / 1000;

    try {

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    started_at:
                        gameStartTime.toISOString(),

                    completed_at:
                        completedAt.toISOString(),

                    score:
                        currentCatchIndex,

                    strikes:
                        strikes,

                    time_seconds:
                        timeSeconds,

                    attempts:
                        gameAttempt

                })

            }
        );

        const data = await response.json();

        console.log(
            "Game session saved:",
            data
        );

    }

    catch (error) {

        console.error(
            "Could not save game session:",
            error
        );

    }

}


/* ==================================================
   SCREEN SWITCHING
================================================== */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(function(screen) {

        screen.classList.remove("active");

    });

    const targetScreen =
        document.getElementById(screenId);

    if (targetScreen) {

        targetScreen.classList.add("active");

    }

}


/* ==================================================
   INTRO
================================================== */

document
    .getElementById("next-button")
    .addEventListener(
        "click",
        function() {

            showScreen("instructions");

        }
    );


/* ==================================================
   INGREDIENT INFORMATION
================================================== */

const ingredientTypes = [

    "frosting",
    "strawberry",
    "butter",
    "sugar",
    "egg",
    "milk",
    "flour",
    "oil"

];


const ingredientImages = {

    frosting:
        "images/frosting.png",

    strawberry:
        "images/strawberry.png",

    butter:
        "images/butter.png",

    sugar:
        "images/sugar.png",

    egg:
        "images/egg.png",

    milk:
        "images/milk.png",

    flour:
        "images/flour.png",

    oil:
        "images/oil.png"

};


const needed = {

    frosting: 3,

    strawberry: 4,

    butter: 2,

    sugar: 1,

    egg: 3,

    milk: 1,

    flour: 2,

    oil: 2

};


/* ==================================================
   RECIPE ORDER
================================================== */

let catchOrder = [];

ingredientTypes.forEach(
    function(type) {

        for (
            let i = 0;
            i < needed[type];
            i++
        ) {

            catchOrder.push(type);

        }

    }
);


/* ==================================================
   COLLECTED
================================================== */

let collected = {

    frosting: 0,
    strawberry: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milk: 0,
    flour: 0,
    oil: 0

};


/* ==================================================
   GO BUTTON
================================================== */

document
    .getElementById("go-button")
    .addEventListener(
        "click",
        function() {

            showScreen("catch-instructions");

        }
    );


/* ==================================================
   START CATCHING BUTTON
================================================== */

document
    .getElementById("start-catching-button")
    .addEventListener(
        "click",
        function() {

            showScreen("catch-game");

            startCatchGame();

        }
    );


/* ==================================================
   CATCHING GAME VARIABLES
================================================== */

const berry =
    document.getElementById("berry");

const fallingContainer =
    document.getElementById(
        "falling-ingredients"
    );

let berryX = 0;

let moveSpeed = 7;

let keys = {

    left: false,
    right: false

};

let gameRunning = false;

let gamePaused = false;

let gameInterval = null;

let fallingObjects = [];

let currentCatchIndex = 0;

let strikes = 0;

const MAX_STRIKES = 3;


/* ==================================================
   START CATCHING GAME
================================================== */

function startCatchGame() {

    startGameSession();

    clearInterval(gameInterval);

    fallingContainer.innerHTML = "";

    fallingObjects = [];


    collected = {

        frosting: 0,
        strawberry: 0,
        butter: 0,
        sugar: 0,
        egg: 0,
        milk: 0,
        flour: 0,
        oil: 0

    };


    currentCatchIndex = 0;

    strikes = 0;


    updateProgress();

    updateStrikeDisplay();

    updateCurrentIngredient();


    berryX =
        (window.innerWidth / 2) -
        (berry.offsetWidth / 2);


    berry.style.left =
        berryX + "px";

    berry.style.transform =
        "none";


    gameRunning = false;

    gamePaused = false;


    document
        .getElementById("pause-overlay")
        .classList.remove("active");


    startCountdown();

}


/* ==================================================
   COUNTDOWN
================================================== */

function startCountdown() {

    const countdown =
        document.getElementById("countdown");

    let number = 3;

    countdown.textContent =
        number;


    const countdownTimer =
        setInterval(function() {

            number--;


            if (number > 0) {

                countdown.textContent =
                    number;

            }

            else {

                countdown.textContent =
                    "GET READY!";


                setTimeout(function() {

                    countdown.textContent = "";

                    createFallingIngredient();

                    gameRunning = true;

                    startGameLoop();

                }, 1800);


                clearInterval(
                    countdownTimer
                );

            }

        }, 1000);

}


/* ==================================================
   CREATE FALLING INGREDIENT
================================================== */

function createFallingIngredient() {

    fallingContainer.innerHTML = "";

    fallingObjects = [];


    const targetType =
        catchOrder[currentCatchIndex];


    createFallingObject(
        targetType,
        true
    );


    let wrongTypes =
        ingredientTypes.filter(
            function(type) {

                return type !== targetType;

            }
        );


    wrongTypes =
        wrongTypes.sort(
            function() {

                return Math.random() - 0.5;

            }
        );


    const wrongIngredientCount =
        window.innerWidth <= 600 ? 2 : 5;


    for (
        let i = 0;
        i < wrongIngredientCount;
        i++
    ) {

        const wrongType =
            wrongTypes[
                i % wrongTypes.length
            ];


        createFallingObject(
            wrongType,
            false
        );

    }

}


/* ==================================================
   CREATE INDIVIDUAL FALLING OBJECT
================================================== */

function createFallingObject(
    type,
    isTarget
) {

    const ingredient =
        document.createElement("img");


    ingredient.src =
        ingredientImages[type];

    ingredient.className =
        "falling-ingredient";

    ingredient.dataset.type =
        type;

    ingredient.dataset.target =
        isTarget ? "true" : "false";


    const listWidth = 250;

    const playWidth =
        Math.max(
            350,
            window.innerWidth - listWidth
        );


    const maxX =
        playWidth - 75;


    let x;

    let tries = 0;


    do {

        x =
            Math.max(
                15,
                Math.random() * maxX
            );

        tries++;

    }

    while (
        fallingObjects.some(
            function(object) {

                return Math.abs(
                    object.posX - x
                ) < 100;

            }
        ) &&
        tries < 20
    );


    const y =
        -100 -
        Math.random() * 250;


    ingredient.style.left =
        x + "px";

    ingredient.style.top =
        y + "px";


    fallingContainer.appendChild(
        ingredient
    );


    fallingObjects.push({

        element: ingredient,

        type: type,

        posX: x,

        posY: y,

        speed:
            2.8 +
            Math.random() * 1.8

    });

}


/* ==================================================
   GAME LOOP
================================================== */

function startGameLoop() {

    gameInterval =
        setInterval(function() {

            if (
                !gameRunning ||
                gamePaused
            ) {

                return;

            }


            moveBerry();

            moveIngredients();

            checkCollisions();

            checkMissedTarget();

        }, 16);

}


/* ==================================================
   MOVE BERRY
================================================== */

function moveBerry() {

    if (keys.left) {

        berryX -= moveSpeed;

    }


    if (keys.right) {

        berryX += moveSpeed;

    }


    const maxX =
        window.innerWidth -
        berry.offsetWidth;


    if (berryX < 0) {

        berryX = 0;

    }


    if (berryX > maxX) {

        berryX = maxX;

    }


    berry.style.left =
        berryX + "px";

    berry.style.transform =
        "none";

}


/* ==================================================
   KEYBOARD CONTROLS
================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = true;

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = true;

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = false;

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = false;

        }

    }
);


/* ==================================================
   TOUCH BUTTONS
================================================== */

const leftButton =
    document.getElementById("left-button");

const rightButton =
    document.getElementById("right-button");


leftButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        berryX -= 20;

        moveBerry();

    }
);


rightButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        berryX += 20;

        moveBerry();

    }
);


/* ==================================================
   MOVE INGREDIENTS
================================================== */

function moveIngredients() {

    fallingObjects.forEach(
        function(object) {

            object.posY +=
                object.speed;

            object.element.style.top =
                object.posY + "px";

        }
    );

}


/* ==================================================
   CHECK MISSED TARGET
================================================== */

function checkMissedTarget() {

    for (
        let i = fallingObjects.length - 1;
        i >= 0;
        i--
    ) {

        const object =
            fallingObjects[i];


        if (
            object.posY >
            window.innerHeight
        ) {

            if (
                object.type ===
                catchOrder[currentCatchIndex]
            ) {

                addStrike();


                if (!gameRunning) {

                    return;

                }


                createFallingIngredient();

                return;

            }

            else {

                object.element.remove();

                fallingObjects.splice(
                    i,
                    1
                );

            }

        }

    }

}


/* ==================================================
   COLLISION
================================================== */

function checkCollisions() {

    const berryRect =
        berry.getBoundingClientRect();


    for (
        let i = fallingObjects.length - 1;
        i >= 0;
        i--
    ) {

        const object =
            fallingObjects[i];


        const ingredientRect =
            object.element
                .getBoundingClientRect();


        const collision = (

            berryRect.left +
                berryRect.width * 0.25 <
            ingredientRect.right &&

            berryRect.right -
                berryRect.width * 0.25 >
            ingredientRect.left &&

            berryRect.top +
                berryRect.height * 0.25 <
            ingredientRect.bottom &&

            berryRect.bottom -
                berryRect.height * 0.25 >
            ingredientRect.top

        );


        if (collision) {

            const type =
                object.type;


            /* CORRECT INGREDIENT */

            if (
                type ===
                catchOrder[currentCatchIndex]
            ) {

                collected[type]++;

                currentCatchIndex++;


                updateProgress();

                updateCurrentIngredient();


                object.element.remove();

                fallingObjects.splice(
                    i,
                    1
                );


                if (
                    currentCatchIndex >=
                    catchOrder.length
                ) {

                    finishCatchGame();

                    return;

                }


                createFallingIngredient();

                return;

            }


            /* WRONG INGREDIENT */

            else {

                addStrike();


                if (!gameRunning) {

                    return;

                }


                object.element.remove();

                fallingObjects.splice(
                    i,
                    1
                );

            }

        }

    }

}


/* ==================================================
   ADD STRIKE
================================================== */

function addStrike() {

    strikes++;

    updateStrikeDisplay();


    if (
        strikes >= MAX_STRIKES
    ) {

        loseGame();

    }

}


/* ==================================================
   UPDATE STRIKE DISPLAY
================================================== */

function updateStrikeDisplay() {

    document
        .getElementById("strike-count")
        .textContent =
            strikes;

}


/* ==================================================
   LOSE GAME
================================================== */

function loseGame() {

    gameRunning = false;

    sendGameSession();

    gamePaused = false;

    clearInterval(gameInterval);

    fallingContainer.innerHTML = "";

    fallingObjects = [];


    document
        .getElementById("pause-overlay")
        .classList.remove("active");


    showScreen("lose-screen");

}


/* ==================================================
   RETRY
================================================== */

document
    .getElementById("retry-button")
    .addEventListener(
        "click",
        function() {

            showScreen("catch-game");

            startCatchGame();

        }
    );


/* ==================================================
   UPDATE CATCHING PROGRESS
================================================== */

function updateProgress() {

    ingredientTypes.forEach(
        function(type) {

            const element =
                document.getElementById(
                    "progress-" + type
                );


            if (element) {

                element.textContent =
                    collected[type] +
                    "/" +
                    needed[type];

            }

        }
    );

}


/* ==================================================
   HIGHLIGHT CURRENT INGREDIENT
================================================== */

function updateCurrentIngredient() {

    ingredientTypes.forEach(
        function(type) {

            const row =
                document.getElementById(
                    "progress-row-" + type
                );


            if (row) {

                row.classList.remove(
                    "current-ingredient"
                );

            }

        }
    );


    if (
        currentCatchIndex >=
        catchOrder.length
    ) {

        return;

    }


    const currentType =
        catchOrder[currentCatchIndex];


    const currentRow =
        document.getElementById(
            "progress-row-" +
            currentType
        );


    if (currentRow) {

        currentRow.classList.add(
            "current-ingredient"
        );

    }

}


/* ==================================================
   FINISH CATCHING GAME
================================================== */

function finishCatchGame() {

    gameRunning = false;

    clearInterval(gameInterval);


    document
        .getElementById("final-strikes")
        .textContent =
            "Strikes: " +
            strikes;


    showScreen(
        "finished-catching"
    );

}


/* ==================================================
   PAUSE
================================================== */

document
    .getElementById("pause-button")
    .addEventListener(
        "click",
        function() {

            if (!gameRunning) {

                return;

            }


            gamePaused = true;


            document
                .getElementById(
                    "pause-overlay"
                )
                .classList.add("active");

        }
    );


document
    .getElementById("resume-button")
    .addEventListener(
        "click",
        function() {

            gamePaused = false;


            document
                .getElementById(
                    "pause-overlay"
                )
                .classList.remove("active");

        }
    );


/* ==================================================
   CAKE MAKING
================================================== */

document
    .getElementById("finished-next-button")
    .addEventListener(
        "click",
        function() {

            showScreen(
                "cake-making"
            );

            startCakeMaking();

        }
    );


let cakeProgress = {

    frosting: 0,
    strawberry: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milk: 0,
    flour: 0,
    oil: 0

};


let draggedIngredient = null;

let dragOffsetX = 0;

let dragOffsetY = 0;


/* ==================================================
   START CAKE MAKING
================================================== */

function startCakeMaking() {

    const container =
        document.getElementById(
            "drag-ingredients"
        );


    container.innerHTML = "";


    cakeProgress = {

        frosting: 0,
        strawberry: 0,
        butter: 0,
        sugar: 0,
        egg: 0,
        milk: 0,
        flour: 0,
        oil: 0

    };


    updateCakeProgress();


    for (
        let type of ingredientTypes
    ) {

        createCakeIngredient(
            type,
            container
        );

    }

}


/* ==================================================
   CREATE CAKE INGREDIENT
================================================== */

function createCakeIngredient(
    type,
    container
) {

    const ingredient =
        document.createElement("img");


    ingredient.src =
        ingredientImages[type];


    ingredient.className =
        "draggable-ingredient";


    ingredient.dataset.type =
        type;


    ingredient.addEventListener(
        "pointerdown",
        startDragging
    );


    container.appendChild(
        ingredient
    );

}


/* ==================================================
   START DRAGGING
================================================== */

function startDragging(event) {

    event.preventDefault();


    draggedIngredient =
        event.currentTarget;


    const rect =
        draggedIngredient
            .getBoundingClientRect();


    dragOffsetX =
        event.clientX -
        rect.left;


    dragOffsetY =
        event.clientY -
        rect.top;


    draggedIngredient.style.position =
        "fixed";

    draggedIngredient.style.zIndex =
        "1000";

    draggedIngredient.style.pointerEvents =
        "none";


    draggedIngredient.style.left =
        (
            event.clientX -
            dragOffsetX
        ) + "px";


    draggedIngredient.style.top =
        (
            event.clientY -
            dragOffsetY
        ) + "px";


    document.addEventListener(
        "pointermove",
        dragIngredient
    );


    document.addEventListener(
        "pointerup",
        stopDragging
    );

}


/* ==================================================
   DRAG INGREDIENT
================================================== */

function dragIngredient(event) {

    if (!draggedIngredient) {

        return;

    }


    draggedIngredient.style.left =
        (
            event.clientX -
            dragOffsetX
        ) + "px";


    draggedIngredient.style.top =
        (
            event.clientY -
            dragOffsetY
        ) + "px";

}


/* ==================================================
   STOP DRAGGING
================================================== */

function stopDragging(event) {

    if (!draggedIngredient) {

        return;

    }


    const ingredient =
        draggedIngredient;

    const bowl =
        document.getElementById("bowl");

    const type =
        ingredient.dataset.type;


    const bowlRect =
        bowl.getBoundingClientRect();


    /*
       MOBILE-FRIENDLY DROP DETECTION

       Instead of requiring the whole ingredient
       image to overlap the bowl, we check whether
       the user's finger is inside the bowl when
       they release the ingredient.
    */

    const droppedInBowl =
        event.clientX >= bowlRect.left &&
        event.clientX <= bowlRect.right &&
        event.clientY >= bowlRect.top &&
        event.clientY <= bowlRect.bottom;


    document.removeEventListener(
        "pointermove",
        dragIngredient
    );

    document.removeEventListener(
        "pointerup",
        stopDragging
    );


    /* ==========================================
       INGREDIENT WAS DROPPED INTO BOWL
    ========================================== */

    if (droppedInBowl) {

        cakeProgress[type]++;

        updateCakeProgress();


        console.log(
            "Added:",
            type,
            cakeProgress[type] +
            "/" +
            needed[type]
        );


        /*
           Remove the ingredient once its required
           amount has been reached.
        */

        if (
            cakeProgress[type] >=
            needed[type]
        ) {

            ingredient.remove();

        }

        else {

            draggedIngredient =
                ingredient;

            resetDraggedIngredient();

        }


        /*
           CHECK FOR COMPLETE CAKE
        */

        if (cakeMakingFinished()) {

            console.log(
                "CAKE COMPLETE!"
            );

            console.log(
                "Final cake progress:",
                cakeProgress
            );


            draggedIngredient = null;


            showScreen(
                "final-screen"
            );


            setTimeout(
                function() {

                    sendGameSession();

                },
                100
            );


            return;

        }

    }


    /* ==========================================
       INGREDIENT MISSED THE BOWL
    ========================================== */

    else {

        draggedIngredient =
            ingredient;

        resetDraggedIngredient();

    }


    draggedIngredient = null;

}


/* ==================================================
   RESET DRAGGED INGREDIENT
================================================== */

function resetDraggedIngredient() {

    if (!draggedIngredient) {

        return;

    }


    draggedIngredient.style.position =
        "static";


    draggedIngredient.style.left =
        "";


    draggedIngredient.style.top =
        "";


    draggedIngredient.style.zIndex =
        "";


    draggedIngredient.style.pointerEvents =
        "auto";

}


/* ==================================================
   UPDATE CAKE PROGRESS
================================================== */

function updateCakeProgress() {

    ingredientTypes.forEach(
        function(type) {

            const element =
                document.getElementById(
                    "cake-" + type
                );


            if (element) {

                element.textContent =
                    cakeProgress[type] +
                    "/" +
                    needed[type];

            }


            const row =
                document.getElementById(
                    "cake-row-" + type
                );


            if (row) {

                if (
                    cakeProgress[type] >=
                    needed[type]
                ) {

                    row.classList.add(
                        "cake-complete"
                    );

                }

                else {

                    row.classList.remove(
                        "cake-complete"
                    );

                }

            }

        }
    );

}


/* ==================================================
   CHECK CAKE COMPLETION
================================================== */

function cakeMakingFinished() {

    for (
        let type of ingredientTypes
    ) {

        if (
            cakeProgress[type] <
            needed[type]
        ) {

            return false;

        }

    }


    return true;

}
