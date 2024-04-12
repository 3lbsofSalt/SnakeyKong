MyGame.objects.Head = function (spec) {
    //------------------------------------------------------------------
    //
    // Move in the direction of the rotation.
    //
    //------------------------------------------------------------------
    function moveForward(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.rotation);
        let vectorY = Math.sin(spec.rotation);
        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        //
        // With the normalized direction vector, move the center of the sprite
        spec.center.x += (vectorX / magnitude) * spec.moveRate * elapsedTime;
        spec.center.y += (vectorY / magnitude) * spec.moveRate * elapsedTime;
    }

    function rotateLeft(elapsedTime) {
        spec.rotation -= spec.rotateRate * elapsedTime;
    }

    function rotateRight(elapsedTime) {
        spec.rotation += spec.rotateRate * elapsedTime;
    }

    function setDirectionRight(elapsedTime) {
        if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.up)) {
            setDirectionUpRight();
        } else if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.down)) {
            setDirectionDownRight();
        } else {
            spec.desiredRotation = 0;
        }
    }

    function setDirectionUpRight(elapsedTime) {
        spec.desiredRotation = (7 * Math.PI) / 4;
    }

    function setDirectionUp(elapsedTime) {
        if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.left)) {
            setDirectionUpLeft();
        } else if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.right)) {
            setDirectionUpRight();
        } else {
            spec.desiredRotation = (3 * Math.PI) / 2;
        }
    }

    function setDirectionUpLeft(elapsedTime) {
        spec.desiredRotation = (5 * Math.PI) / 4;
    }

    function setDirectionLeft(elapsedTime) {
        if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.up)) {
            setDirectionUpLeft();
        } else if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.down)) {
            setDirectionDownLeft();
        } else {
            spec.desiredRotation = Math.PI;
        }
    }

    function setDirectionDownLeft(elapsedTime) {
        spec.desiredRotation = (3 * Math.PI) / 4;
    }

    function setDirectionDown(elapsedTime) {
        if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.left)) {
            setDirectionDownLeft();
        } else if (spec.keyboard.keys.hasOwnProperty(MyGame.input.keys.right)) {
            setDirectionDownRight();
        } else {
            spec.desiredRotation = Math.PI / 2;
        }
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
        get desiredRotation() {
            return spec.desiredRotation;
        },
        get newTurnInstruction() {
            return spec.newTurnInstruction;
        },
        set newTurnInstruction(val) {
            spec.newTurnInstruction = val;
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

        let moveX = (vectorX / magnitude) * elapsedTime * spec.moveRate;
        let moveY = (vectorY / magnitude) * elapsedTime * spec.moveRate;

        spec.center.x += moveX;
        spec.center.y += moveY;

        const moveMag = Math.sqrt(moveX ** 2 + moveY ** 2);
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
    // What do I want?
    // Move forward
    // Just a reference to a head
    // head has reference to first body member
    // each body member has reference to next body member until null
    const snake = {
        direction: spec.direction,
        moveRate: spec.moveRate,
        rotateRate: spec.rotateRate,
        head: MyGame.objects.Head({
            size: { x: 75, y: 50 }, // Size in pixels
            center: { x: 250, y: 350 },
            rotation: spec.rotation,
            desiredRotation: spec.rotation,
            moveRate: spec.moveRate, // Pixels per second
            rotateRate: spec.rotateRate, // Radians per second
            keyboard: spec.keyboard,
        }),
        segmentDistance: spec.segmentDistance,
        body: [],
        headRenderer: spec.headRenderer,
        bodyRenderer: spec.bodyRenderer,
    };

    const lastLocationsTracker = [];
    for (let i = 0; i < spec.startingSegments; i++) {
        const yDiff = Math.sin(spec.rotation) * spec.segmentDistance;
        const xDiff = Math.cos(spec.rotation) * spec.segmentDistance;

        const lastLocation =
            i == 0 ? { ...snake.head.center } : { ...snake.body[i - 1].center };
        lastLocationsTracker.unshift(lastLocation);

        const queue = createQueue();
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
                rotation: spec.rotation,
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
    snake.setDirectionDown = function (elapsedTime) {
        snake.head.setDirectionDown(elapsedTime);
    };
    snake.setDirectionLeft = function (elapsedTime) {
        snake.head.setDirectionLeft(elapsedTime);
    };
    snake.setDirectionRight = function (elapsedTime) {
        snake.head.setDirectionRight(elapsedTime);
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

    return snake;
};
