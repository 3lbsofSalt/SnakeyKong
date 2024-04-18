const dkhead = new Image();
const dkbody = new Image();

dkhead.onload = function () {
    dkhead.isReady = true;
    dkhead.subTextureWidth = dkhead.width;
};
dkhead.src = "assets/dkhead.png";

dkbody.onload = function () {
    dkbody.isReady = true;
    dkbody.subTextureWidth = dkbody.width;
};
dkbody.src = "assets/dkbody.png";

MyGame.objects.Head = function (spec) {
    function moveForward(elapsedTime) {
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.rotation);
        let vectorY = Math.sin(spec.rotation);
        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

        // With the normalized direction vector, move the center of the sprite
        let moveX = (vectorX / magnitude) * spec.moveRate * elapsedTime;
        let moveY = (vectorY / magnitude) * spec.moveRate * elapsedTime;
        console.log(
            "Movement magnitude:",
            Math.sqrt(moveX ** 2 + moveY ** 2),
            "elapsed:",
            elapsedTime,
        );

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
    function moveForward(elapsedTime, nextSegment) {
        let nextLocation, vectorX, vectorY;
        while (true) {
            nextLocation = spec.nextLocations.empty()
                ? nextSegment.center
                : spec.nextLocations.peek();

            // Create a normalized direction vector
            vectorX = nextLocation.x - spec.center.x;
            vectorY = nextLocation.y - spec.center.y;

            if (vectorX != 0 || vectorY != 0) break;
            spec.nextLocations.pop(); // nextLocation is the same as the current location
        }

        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

        let normalizedVectorX = vectorX / magnitude;
        let normalizedVectorY = vectorY / magnitude;

        let moveX = normalizedVectorX * elapsedTime * spec.moveRate;
        let moveY = normalizedVectorY * elapsedTime * spec.moveRate;

        moveX = Math.round(moveX);
        moveY = Math.round(moveY);
        if (isNaN(moveX) || isNaN(moveY)) {
            console.log(spec);
            console.log(magnitude);
            debugger;
        }

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
        name: spec.name,
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
        MyGame.graphics.drawText(
            snake.head.center.x,
            snake.head.center.y - 80,
            snake.name,
            "white",
        );
    };

    snake.isAlive = function () {
        return spec.alive;
    };

    snake.kill = function () {
        spec.alive = false;
        let deathSound = new Audio("assets/audio/deathSound.mp3");
        deathSound.volume = 0.75;
        deathSound.play();
    };

    snake.eatSingleBanana = function () {
        snake.score += 1;
        let eatSound = new Audio("assets/audio/eatSingle.mp3");
        eatSound.play();
    };

    snake.eatBananaBunch = function () {
        snake.score += 10;
        let eatSound = new Audio("assets/audio/eatBunch.mp3");
        eatSound.volume = 0.4;
        eatSound.play();
    };

    return snake;
};
