const dkhead = new Image();
const dkbodyGold = new Image();
const dkbodyRed = new Image();
const dktail = new Image();

dkhead.onload = function () {
    dkhead.isReady = true;
    dkhead.subTextureWidth = dkhead.width;
};
dkhead.src = "assets/dkhead.png";

dkbodyGold.onload = function () {
    dkbodyGold.isReady = true;
    dkbodyGold.subTextureWidth = dkbodyGold.width;
};
dkbodyGold.src = "assets/dkbodyGold.png";

dkbodyRed.onload = function () {
    dkbodyRed.isReady = true;
    dkbodyRed.subTextureWidth = dkbodyRed.width;
};
dkbodyRed.src = "assets/dkbodyRed.png";

dktail.onload = function () {
    dktail.isReady = true;
    dktail.subTextureWidth = dktail.width;
};
dktail.src = "assets/tailSegment.png";

function createBody(center, inflection_points) {
    const body = {
        center: { ...center },
        inflection_points: [...inflection_points],
    };

    body.moveTowardHead = function (distanceMagnitude, snakeCenter) {
        const vectorX = snakeCenter.x - body.center.x;
        const vectorY = snakeCenter.y - body.center.y;

        const magnitude = Math.sqrt(vectorX ** 2 + vectorY ** 2);

        body.center.x += (vectorX / magnitude) * distanceMagnitude;
        body.center.y += (vectorY / magnitude) * distanceMagnitude;
    };

    body.moveForward = function (distanceMagnitude, snakeCenter) {
        let leftover = distanceMagnitude;
        while (leftover > 0) {
            if (body.inflection_points.length === 0) {
                body.moveTowardHead(leftover, snakeCenter);
                break;
            } else {
                const nextPoint = body.inflection_points[0];
                const vectorX = nextPoint.x - body.center.x;
                const vectorY = nextPoint.y - body.center.y;

                const magnitude = Math.sqrt(vectorX ** 2 + vectorY ** 2);
                // There is leftover distance to travel
                if (magnitude < leftover) {
                    body.center.x = nextPoint.x;
                    body.center.y = nextPoint.y;
                    leftover -= magnitude;
                    body.inflection_points.shift();
                } else {
                    body.center.x += (vectorX / magnitude) * leftover;
                    body.center.y += (vectorY / magnitude) * leftover;
                    break;
                }
            }
        }
    };

    return body;
}

MyGame.objects.Snake = function (
    center,
    direction,
    moveRate,
    rotateRate,
    rotationTolerance,
    renderSize,
    invincibilityTimeLeft,
    name,
    headRenderer,
    bodyRenderer,
    tailRenderer,
    headImage,
    bodyImage,
    tailImage,
    startingSegments,
    score,
    body = [],
) {
    const snake = {
        center: { ...center },
        desiredDirection: direction,
        direction,
        moveRate,
        rotateRate,
        rotationTolerance,
        renderSize,
        invincibilityTimeLeft,
        name,
        headRenderer,
        bodyRenderer,
        tailRenderer,
        alive: true,
        body: [],
        score,
        headImage,
        bodyImage,
        tailImage,
    };

    const segmentDistance = 30;

    let enterSound = new Audio("assets/audio/enterArena.mp3");
    enterSound.play();

    if (body.length === 0) {
        const vectorY = Math.sin(snake.direction);
        const vectorX = Math.cos(snake.direction);

        for (let i = 0; i < startingSegments; i++) {
            snake.body.push(
                createBody(
                    {
                        x: snake.center.x - vectorX * segmentDistance * (i + 1),
                        y: snake.center.y - vectorY * segmentDistance * (i + 1),
                    },
                    [],
                ),
            );
        }
    } else {
        for (let i = 0; i < body.length; i++) {
            snake.body.push(
                createBody(
                    {
                        x: body[i].center.x,
                        y: body[i].center.y,
                    },
                    body[i].inflection_points,
                ),
            );
        }
    }

    snake.addTurnPoint = function (point) {
        for (const body of snake.body) {
            body.inflection_points.push({ ...point });
        }
    };

    snake.adjustPosition = function (adjustment) {
        snake.center.x += adjustment.x;
        snake.center.y += adjustment.y;

        for (const seg of snake.body) {
            seg.center.x += adjustment.x;
            seg.center.y += adjustment.y;
        }
    };

    snake.isInvincible = function () {
        return snake.invincibilityTimeLeft > 0;
    };

    snake.needsNewBodyPiece = function () {
        return snake.score >= (snake.body.length - startingSegments + 1) * 20;
    };
    snake.setRotation = function (direction) {
        snake.desiredDirection = direction;
    };

    snake.needsRotate = function () {
        return (
            Math.abs(snake.direction - snake.desiredDirection) >
            snake.rotationTolerance
        );
    };

    snake.updateRotation = function (elapsedTime) {
        snake.direction = (snake.direction + 2 * Math.PI) % (2 * Math.PI);

        if (
            Math.abs(snake.direction - snake.desiredDirection) >
            snake.rotationTolerance
        ) {
            const leftIsCloser =
                (snake.desiredDirection - snake.direction + 2 * Math.PI) %
                    (2 * Math.PI) >
                Math.PI;
            if (leftIsCloser) {
                snake.direction -= snake.rotateRate * elapsedTime;
            } else {
                snake.direction += snake.rotateRate * elapsedTime;
            }
        } else {
            snake.direction = snake.desiredDirection;
        }

        snake.direction = (snake.direction + 2 * Math.PI) % (2 * Math.PI);
    };

    snake.moveForward = function (elapsedTime) {
        let vectorX = Math.cos(snake.direction);
        let vectorY = Math.sin(snake.direction);
        let magnitude = Math.sqrt(vectorX ** 2 + vectorY ** 2);

        // With the normalized direction vector, move the center of the sprite
        let moveX = (vectorX / magnitude) * snake.moveRate * elapsedTime;
        let moveY = (vectorY / magnitude) * snake.moveRate * elapsedTime;

        snake.center.x += moveX;
        snake.center.y += moveY;

        const headDistance = Math.sqrt(moveX ** 2 + moveY ** 2);
        for (let i = 0; i < snake.body.length; i++) {
            snake.body[i].moveForward(headDistance, snake.center);
        }
    };

    snake.isAlive = function () {
        return snake.alive;
    };

    snake.kill = function () {
        snake.alive = false;
        let deathSound = new Audio("assets/audio/deathSound.mp3");
        deathSound.volume = 0.75;
        deathSound.play();
    };

    snake.setDirectionRight = function (elapsedTime) {
        snake.desiredDirection = 0;
    };
    snake.setDirectionUpRight = function (elapsedTime) {
        snake.desiredDirection = (7 * Math.PI) / 4;
    };
    snake.setDirectionUp = function (elapsedTime) {
        snake.desiredDirection = (3 * Math.PI) / 2;
    };
    snake.setDirectionUpLeft = function (elapsedTime) {
        snake.desiredDirection = (5 * Math.PI) / 4;
    };
    snake.setDirectionLeft = function (elapsedTime) {
        snake.desiredDirection = Math.PI;
    };
    snake.setDirectionDownLeft = function (elapsedTime) {
        snake.desiredDirection = (3 * Math.PI) / 4;
    };
    snake.setDirectionDown = function (elapsedTime) {
        snake.desiredDirection = Math.PI / 2;
    };
    snake.setDirectionDownRight = function (elapsedTime) {
        snake.desiredDirection = Math.PI / 4;
    };

    snake.eatSingleBanana = function () {
        snake.score += 1;
        snake.renderSize = Math.min(snake.renderSize + 0.1, 200);
        let eatSound = new Audio("assets/audio/eatSingle.mp3");
        eatSound.play();
    };

    snake.eatBananaBunch = function () {
        snake.score += 10;
        snake.renderSize = Math.min(snake.renderSize + 1, 200);
        let eatSound = new Audio("assets/audio/eatBunch.mp3");
        eatSound.volume = 0.4;
        eatSound.play();
    };

    snake.updateInvincibility = function (elapsedTime) {
        if (snake.isInvincible()) {
            snake.invincibilityTimeLeft -= elapsedTime;
            if (!snake.isInvincible()) {
                let okaySound = new Audio("assets/audio/okay.mp3");
                okaySound.play();
            }
        }
    };

    snake.update = function (elapsedTime) {
        snake.moveForward(elapsedTime);
        snake.updateRotation(elapsedTime);
        snake.updateInvincibility(elapsedTime);
    };

    snake.getHeadImage = function () {
        return snake.headImage;
    };

    snake.getBodyImage = function () {
        return snake.bodyImage;
    };

    snake.getTailImage = function () {
        return snake.tailImage;
    };

    snake.render = function () {
        const vectorX =
            snake.body[snake.body.length - 2].center.x -
            snake.body[snake.body.length - 1].center.x;
        const vectorY =
            snake.body[snake.body.length - 2].center.y -
            snake.body[snake.body.length - 1].center.y;

        let rot =
            (Math.atan(vectorY / vectorX) - Math.PI / 2 + Math.PI * 2) %
            (Math.PI * 2);
        if (vectorX < 0) {
            rot += Math.PI;
        }

        for (let i = snake.body.length - 2; i >= 0; i--) {
            snake.bodyRenderer.render({
                image: snake.getBodyImage(),
                center: snake.body[i].center,
                rotation: 0,
                size: { x: snake.renderSize, y: snake.renderSize },
            });
        }

        snake.tailRenderer.render({
            image: snake.getTailImage(),
            center: snake.body[snake.body.length - 1].center,
            rotation: rot,
            size: { x: snake.renderSize * 0.75, y: snake.renderSize },
        });

        snake.headRenderer.render({
            image: snake.getHeadImage(),
            center: snake.center,
            rotation: snake.direction,
            size: { x: snake.renderSize * 1.5, y: snake.renderSize },
        });

        MyGame.graphics.drawText(
            snake.center.x,
            snake.center.y - 80,
            snake.name,
            "white",
        );
    };

    return snake;
};
