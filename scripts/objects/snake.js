//const createQueue = require(["server/src/shared/Queue.js"]);
MyGame.objects.Head = function (spec) {
    //------------------------------------------------------------------
    //
    // Move in the direction of the rotation.
    //
    //------------------------------------------------------------------

    //------------------------------------------------------------------
    function moveForward(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.rotation);
        let vectorY = Math.sin(spec.rotation);
        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        //
        // With the normalized direction vector, move the center of the sprite
        let moveX = (vectorX / magnitude) * spec.moveRate * elapsedTime;
        let moveY = (vectorY / magnitude) * spec.moveRate * elapsedTime;

        moveX = Math.round(moveX);
        moveY = Math.round(moveY);

        spec.center.x += moveX;
        spec.center.y += moveY;
    }

    function rotateLeft(elapsedTime) {
        spec.rotation -= spec.rotateRate * elapsedTime;
    }

    function rotateRight(elapsedTime) {
        spec.rotation += spec.rotateRate * elapsedTime;
    }

    function setDirectionRight(elapsedTime) {
        spec.desiredRotation = 0;
    }

    function setDirectionUpRight(elapsedTime) {
        spec.desiredRotation = (7 * Math.PI) / 4;
    }

    function setDirectionUp(elapsedTime) {
        spec.desiredRotation = (3 * Math.PI) / 2;
    }

    function setDirectionUpLeft(elapsedTime) {
        spec.desiredRotation = (5 * Math.PI) / 4;
    }

    function setDirectionLeft(elapsedTime) {
        spec.desiredRotation = Math.PI;
    }

    function setDirectionDownLeft(elapsedTime) {
        spec.desiredRotation = (3 * Math.PI) / 4;
    }

    function setDirectionDown(elapsedTime) {
        spec.desiredRotation = Math.PI / 2;
    }

    function setDirectionDownRight(elapsedTime) {
        spec.desiredRotation = Math.PI / 4;
    }

    let api = {
        get size() {
            return spec.size;
        },
        get center() {
            return spec.center;
        },
        get rotation() {
            return spec.rotation;
        },
        get image() {
            return spec.image;
        },
        get desiredRotation() {
            return spec.desiredRotation;
        },
        get newTurnInstruction() {
            return spec.newTurnInstruction;
        },
        set newTurnInstruction(val) {
            spec.newTurnInstruction = val;
        },
        set desiredRotation(val) {
            return (spec.desiredRotation = val);
        },
        set rotation(val) {
            return (spec.rotation = val);
        },
        moveForward: moveForward,
        rotateLeft: rotateLeft,
        rotateRight: rotateRight,
        setDirectionRight: setDirectionRight,
        setDirectionUpRight: setDirectionUpRight,
        setDirectionUp: setDirectionUp,
        setDirectionUpLeft: setDirectionUpLeft,
        setDirectionLeft: setDirectionLeft,
        setDirectionDownLeft: setDirectionDownLeft,
        setDirectionDown: setDirectionDown,
        setDirectionDownRight: setDirectionDownRight,
    };

    return api;
};

MyGame.objects.Body = function (spec) {
    //------------------------------------------------------------------
    //
    // Move in the direction of the rotation.
    //
    //------------------------------------------------------------------
    function moveForward(elapsedTime, nextSegment, segmentDistance) {
        const nextLocation = spec.nextLocations.empty()
            ? nextSegment.center
            : spec.nextLocations.peek();

        // Create a normalized direction vector
        let vectorX = nextLocation.x - spec.center.x;
        let vectorY = nextLocation.y - spec.center.y;

        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

        let normalizedVectorX = vectorX / magnitude;
        let normalizedVectorY = vectorY / magnitude;

        let moveX = normalizedVectorX * elapsedTime * spec.moveRate;
        let moveY = normalizedVectorY * elapsedTime * spec.moveRate;

        moveX = Math.round(moveX);
        moveY = Math.round(moveY);

        spec.center.x += moveX;
        spec.center.y += moveY;

        const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveMag >= magnitude) {
            spec.nextLocations.pop();
        }
    }

    let api = {
        get size() {
            return spec.size;
        },
        get center() {
            return spec.center;
        },
        get image() {
            return spec.image;
        },
        get rotation() {
            return spec.rotation;
        },
        get nextLocations() {
            return spec.nextLocations;
        },
        moveForward: moveForward,
    };

    return api;
};

MyGame.objects.Snake = function (spec) {
    const snake = {
        direction: spec.direction,
        moveRate: spec.moveRate,
        rotateRate: spec.rotateRate,
        head: MyGame.objects.Head({
            size: { x: 75, y: 50 }, // Size in pixels
            center: { ...spec.center },
            rotation: spec.direction,
            image: spec.headimage,
            desiredRotation: spec.direction,
            moveRate: spec.moveRate, // Pixels per second
            rotateRate: spec.rotateRate, // Radians per second
        }),
        segmentDistance: spec.segmentDistance,
        score: spec.score,
        body: [],
        headRenderer: spec.headRenderer,
        bodyRenderer: spec.bodyRenderer,
    };

    const lastLocationsTracker = [];
    for (let i = 0; i < spec.startingSegments; i++) {
        const yDiff = Math.sin(spec.direction) * spec.segmentDistance;
        const xDiff = Math.cos(spec.direction) * spec.segmentDistance;

        const lastLocation =
            i == 0 ? { ...snake.head.center } : { ...snake.body[i - 1].center };
        lastLocationsTracker.unshift(lastLocation);

        const queue = Queue.createQueue();
        for (const location of lastLocationsTracker) {
            queue.push(location);
        }

        snake.body.push(
            MyGame.objects.Body({
                size: { x: 50, y: 50 }, // Size in pixels
                center: {
                    x: lastLocation.x - xDiff,
                    y: lastLocation.y - yDiff,
                },
                image: spec.bodyimage,
                rotation: spec.direction,
                moveRate: spec.moveRate, // Pixels per second
                rotateRate: spec.rotateRate, // Radians per second
                nextLocations: queue,
            }),
        );
    }

    snake.moveForward = function (elapsedTime) {
        snake.head.moveForward(elapsedTime);
        for (let i = 0; i < snake.body.length; i++) {
            const nextSegment = i === 0 ? snake.head : snake.body[i - 1];
            snake.body[i].moveForward(
                elapsedTime,
                nextSegment,
                snake.segmentDistance,
            );
        }
    };

    snake.ROTATION_TOL = Math.PI / 50;

    snake.setDirectionUp = function (elapsedTime) {
        snake.head.setDirectionUp(elapsedTime);
    };
    snake.setDirectionUpRight = function (elapsedTime) {
        snake.head.setDirectionUpRight(elapsedTime);
    };
    snake.setDirectionUpLeft = function (elapsedTime) {
        snake.head.setDirectionUpLeft(elapsedTime);
    };
    snake.setDirectionDownLeft = function (elapsedTime) {
        snake.head.setDirectionDownLeft(elapsedTime);
    };
    snake.setDirectionDownRight = function (elapsedTime) {
        snake.head.setDirectionDownRight(elapsedTime);
    };
    snake.setDirectionDown = function (elapsedTime) {
        snake.head.setDirectionDown(elapsedTime);
    };
    snake.setDirectionLeft = function (elapsedTime) {
        snake.head.setDirectionLeft(elapsedTime);
    };
    snake.setDirectionRight = function (elapsedTime) {
        snake.head.setDirectionRight(elapsedTime);
    };
    snake.setRotation = function (rotation) {
        console.log("desired in functino", rotation);
        snake.head.desiredRotation = rotation;
    };

    snake.updateRotation = function (elapsedTime) {
        snake.head.rotation = snake.head.rotation % (2 * Math.PI);
        if (
            Math.abs(snake.head.rotation - snake.head.desiredRotation) >
            snake.ROTATION_TOL
        ) {
            // Add new turn point when the head is being turned.
            const nextBody = { ...snake.head.center };
            for (let i = 0; i < snake.body.length; i++) {
                snake.body[i].nextLocations.push(nextBody);
            }

            const leftIsCloser =
                (snake.head.desiredRotation -
                    snake.head.rotation +
                    2 * Math.PI) %
                    (2 * Math.PI) >
                Math.PI;
            if (leftIsCloser) {
                snake.head.rotateLeft(elapsedTime);
            } else {
                snake.head.rotateRight(elapsedTime);
            }
        } else {
            snake.head.rotation = snake.head.desiredRotation;
        }
    };

    snake.update = function (elapsedTime) {
        snake.headRenderer.update(elapsedTime);
        snake.bodyRenderer.update(elapsedTime);
        snake.moveForward(elapsedTime);
        snake.updateRotation(elapsedTime);
    };

    snake.render = function () {
        for (let i = snake.body.length - 1; i >= 0; i--) {
            snake.bodyRenderer.render(snake.body[i]);
        }
        snake.headRenderer.render(snake.head);
    };

    snake.isAlive = function () {
        return spec.alive;
    };

    snake.kill = function () {
        spec.alive = false;
        let deathSound = new Audio("assets/audio/deathSound.mp3");
        deathSound.play();
    };

    snake.eatSingleBanana = function () {
        snake.score += 1;
        console.log("score: " + snake.score);
        let eatSound = new Audio("assets/audio/eatSingle.mp3");
        eatSound.play();
    };

    snake.eatBananaBunch = function () {
        snake.score += 10;
        console.log("score: " + snake.score);
        let eatSound = new Audio("assets/audio/eatBunch.mp3");
        eatSound.play();
    };

    return snake;
};
