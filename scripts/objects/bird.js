//------------------------------------------------------------------
//
// Creates a Bird model based upon the passed in specification.
//
//------------------------------------------------------------------
MyGame.objects.Bird = function(spec) {

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
            //
            // With the normalized direction vector, move the center of the sprite
            spec.center.x += (vectorX * spec.moveRate * elapsedTime);
            spec.center.y += (vectorY * spec.moveRate * elapsedTime);
    }

    function rotateLeft(elapsedTime) {
        spec.rotation -= spec.rotateRate * (elapsedTime);
    }

    function rotateRight(elapsedTime) {
        spec.rotation += spec.rotateRate * (elapsedTime);
    }

    let api = {
        get size() { return spec.size; },
        get center() { return spec.center; },
        get rotation() { return spec.rotation; },
        moveForward: moveForward,
        rotateLeft: rotateLeft,
        rotateRight: rotateRight
    };

    return api;
};

MyGame.objects.Head = function(spec) {

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
            spec.center.x += (vectorX / magnitude * spec.moveRate * elapsedTime);
            spec.center.y += (vectorY / magnitude * spec.moveRate * elapsedTime);
    }

    function rotateLeft(elapsedTime) {
        spec.rotation -= spec.rotateRate * (elapsedTime);
    }

    function rotateRight(elapsedTime) {
        spec.rotation += spec.rotateRate * (elapsedTime);
    }

    function setDirectionRight(elapsedTime) {
        spec.desiredRotation = 0;
    }

    function setDirectionUpRight(elapsedTime) {
        spec.rotation = 7 * Math.PI / 4;
    }

    function setDirectionUp(elapsedTime) {
        spec.desiredRotation = 3 * Math.PI / 2;
    }

    function setDirectionUpLeft(elapsedTime) {
        spec.desiredRotation = 5 * Math.PI / 4;
    }

    function setDirectionLeft(elapsedTime) {
        spec.desiredRotation = Math.PI;
    }

    function setDirectionDownLeft(elapsedTime) {
        spec.rotation = 3 * Math.PI / 4;
    }

    function setDirectionDown(elapsedTime) {
        spec.desiredRotation = Math.PI / 2;
    }

    function setDirectionDownRight(elapsedTime) {
        spec.rotation = Math.PI / 4;
    }

    let api = {
        get size() { return spec.size; },
        get center() { return spec.center; },
        get rotation() { return spec.rotation; },
        get desiredRotation() { return spec.desiredRotation; },
        get newTurnInstruction() { return spec.newTurnInstruction; },
        set newTurnInstruction(val) { spec.newTurnInstruction = val; },
        set rotation(val) { return spec.rotation = val; },
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
        setDirectionDownRight: setDirectionDownRight
    };

    return api;
};


MyGame.objects.Body = function(spec) {

    //------------------------------------------------------------------
    //
    // Move in the direction of the rotation.
    //
    //------------------------------------------------------------------
    function moveForward(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = spec.nextLocations[0].x - spec.center.x;
        let vectorY = spec.nextLocations[0].y - spec.center.y;

        let magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        // let vectorX = Math.cos(spec.rotation);
        // let vectorY = Math.sin(spec.rotation);
        // With the normalized direction vector, move the center of the sprite
        spec.center.x += (vectorX / magnitude * spec.moveRate * elapsedTime);
        spec.center.y += (vectorY / magnitude * spec.moveRate * elapsedTime);

        spec.nextLocations.pop();
    }

    let api = {
        get size() { return spec.size; },
        get center() { return spec.center; },
        get rotation() { return spec.rotation; },
        get nextLocations() { return spec.nextLocations },
        moveForward: moveForward
    };

    return api;
};
