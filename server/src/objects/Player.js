const Queue = require("../shared/Queue");
const starting_directions = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];

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

Snake = function (
    center,
    direction,
    moveRate,
    rotateRate,
    rotationTolerance,
    renderSize,
    name,
    startingSegments,
    score,
) {
    const snake = {
        center: { ...center },
        desiredDirection: direction,
        direction,
        moveRate,
        rotateRate,
        rotationTolerance,
        renderSize,
        name,
        alive: true,
        body: [],
        score: score,
    };

    const segmentDistance = 30;

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

    snake.addTurnPoint = function (point) {
        for (const body of snake.body) {
            body.inflection_points.push({ ...point });
        }
    };

    snake.needsNewBodyPiece = function () {
        return snake.score >= (snake.body.length - startingSegments + 1) * 20;
    };
    snake.setRotation = function (direction) {
        snake.desiredDirection = direction;
    };

    snake.addBodyPiece = function () {
        const last = snake.body[snake.body.length - 1];
        const nextLast = snake.body[snake.body.length - 2];
        const xDiff = nextLast.center.x - last.center.x;
        const yDiff = nextLast.center.y - last.center.y;

        const mag = Math.sqrt(xDiff ** 2 + yDiff ** 2);

        snake.body.push(
            createBody(
                {
                    x: last.center.x - (xDiff / mag) * segmentDistance,
                    y: last.center.y - (yDiff / mag) * segmentDistance,
                },
                [...last.inflection_points],
            ),
        );
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
        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

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
        snake.renderSize = Math.min(snake.renderSize + 0.1, 200);
        snake.score += 1;
    };

    snake.eatBananaBunch = function () {
        snake.renderSize = Math.min(snake.renderSize + 1, 200);
        snake.score += 10;
    };

    snake.update = function (elapsedTime) {
        snake.moveForward(elapsedTime);
        snake.updateRotation(elapsedTime);
    };

    return snake;
};

const ROTATE_TOL = Math.PI / 50;

function createPlayer(
    socketId,
    moveRate,
    rotateRate,
    segmentDistance,
    renderSize,
    name,
    startingSegments = 3,
) {
    const player = {
        clientId: socketId,
        snake: Snake(
            { x: 1000, y: 1000 },
            starting_directions[Math.floor(Math.random() * 4)],
            moveRate,
            rotateRate,
            ROTATE_TOL,
            //segmentDistance,
            renderSize,
            name,
            startingSegments,
            0,
            /*
            center: {
                x: Math.random() * 4800,
                y: Math.random() * 2600,
            },
      */
        ),
    };

    return player;
}

exports.createPlayer = createPlayer;
