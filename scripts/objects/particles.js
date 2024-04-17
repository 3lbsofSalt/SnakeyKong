const deathParticle = new Image();
const yellowParticle = new Image();
const redParticle = new Image();
const blueParticle = new Image();
const purpleParticle = new Image();
const greenParticle = new Image();

deathParticle.onload = function () {
    deathParticle.isReady = true;
    deathParticle.subTextureWidth = deathParticle.width;
};
deathParticle.src = "assets/deathParticle.png";

yellowParticle.onload = function () {
    yellowParticle.isReady = true;
    yellowParticle.subTextureWidth = yellowParticle.width;
};
yellowParticle.src = "assets/yellowParticle.png";

redParticle.onload = function () {
    redParticle.isReady = true;
    redParticle.subTextureWidth = redParticle.width;
};
redParticle.src = "assets/redParticle.png";

blueParticle.onload = function () {
    blueParticle.isReady = true;
    blueParticle.subTextureWidth = blueParticle.width;
};
blueParticle.src = "assets/blueParticle.png";

purpleParticle.onload = function () {
    purpleParticle.isReady = true;
    purpleParticle.subTextureWidth = purpleParticle.width;
};
purpleParticle.src = "assets/purpleParticle.png";

greenParticle.onload = function () {
    greenParticle.isReady = true;
    greenParticle.subTextureWidth = greenParticle.width;
};
greenParticle.src = "assets/greenParticle.png";

yellowBunch.onload = function () {
    yellowBunch.isReady = true;
    yellowBunch.subTextureWidth = yellowBunch.width / BUNCH_SPRITE_COUNT;
};
yellowBunch.src = "assets/spritesheet-bananaYellowBunch.png";

redBunch.onload = function () {
    redBunch.isReady = true;
    redBunch.subTextureWidth = redBunch.width / BUNCH_SPRITE_COUNT;
};
redBunch.src = "assets/spritesheet-bananaRedBunch.png";

blueBunch.onload = function () {
    blueBunch.isReady = true;
    blueBunch.subTextureWidth = blueBunch.width / BUNCH_SPRITE_COUNT;
};
blueBunch.src = "assets/spritesheet-bananaBlueBunch.png";

purpleBunch.onload = function () {
    purpleBunch.isReady = true;
    purpleBunch.subTextureWidth = purpleBunch.width / BUNCH_SPRITE_COUNT;
};
purpleBunch.src = "assets/spritesheet-bananaPurpleBunch.png";

greenBunch.onload = function () {
    greenBunch.isReady = true;
    greenBunch.subTextureWidth = greenBunch.width / BUNCH_SPRITE_COUNT;
};
greenBunch.src = "assets/spritesheet-bananaGreenBunch.png";

let particleColorImages = [
    yellowParticle,
    redParticle,
    blueParticle,
    purpleParticle,
    greenParticle,
];

const backgroundImage = new Image();

backgroundImage.onload = function () {
    backgroundImage.isReady = true;
    backgroundImage.subTextureWidth = backgroundImage.width;
};
backgroundImage.src = "assets/gameBackdropDK.png";

let banana_particles = [];
let death_particles = [];

function Particle(spec) {
    spec.size = { x: 30, y: 30 };
    spec.alive = 0;

    function update(elapsed_time) {
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsed_time = elapsed_time / 1000;

        // Update how long it has been alive
        spec.alive += elapsed_time;

        // Update its center
        spec.center.x += elapsed_time * spec.speed * spec.direction.x;
        spec.center.y += elapsed_time * spec.speed * spec.direction.y;

        // Rotate proportional to its speed
        spec.rotation += spec.speed / 500;

        // Return true if this particle is still alive
        return spec.alive < spec.lifetime;
    }

    let api = {
        update: update,
        get center() {
            return spec.center;
        },
        get size() {
            return spec.size;
        },
        get rotation() {
            return spec.rotation;
        },
        get age() {
            return spec.alive;
        },
        get image() {
            return spec.image;
        },
    };

    return api;
}

function particleSystem(playerSnake) {
    function eatBanana(banana) {
        // Generate some new particles
        for (let particle = 0; particle < 20; particle++) {
            let negX = Math.random() < 0.5 ? 1 : -1;
            let negY = Math.random() < 0.5 ? 1 : -1;
            let xDrift = (Math.random() / 2) * negX;
            let yDrift = (Math.random() / 2) * negY;
            let p = {
                center: {
                    x: playerSnake.head.center.x,
                    y: playerSnake.head.center.y,
                },
                direction: {
                    x: Math.random() * negX,
                    y: Math.random() * negY,
                },
                image: particleColorImages[banana.color], // determinesColor
                speed: Math.random() * 600, // pixels per second
                rotation: playerSnake.head.direction,
                lifetime: Math.random(), // seconds
            };
            banana_particles.push(Particle(p));
        }
    }

    function snakeCrash(playerSnake) {
        // Generate some new particles
        for (let particle = 0; particle < 30; particle++) {
            let negX = Math.random() < 0.5 ? 1 : -1;
            let negY = Math.random() < 0.5 ? 1 : -1;
            let p = {
                center: {
                    x: playerSnake.head.center.x,
                    y: playerSnake.head.center.y,
                },
                direction: {
                    x: Math.random() * negX,
                    y: Math.random() * negY,
                },
                image: deathParticle,
                speed: Math.random() * 200, // pixels per second
                rotation: playerSnake.head.direction,
                lifetime: Math.random() * 5, // seconds
            };
            death_particles.push(Particle(p));
        }
    }

    return {
        eatBanana: eatBanana,
        snakeCrash: snakeCrash,
    };
}

function updateParticles(elapsed_time) {
    let particle = 0;
    let aliveParticles = [];

    // Update banana particles
    for (particle = 0; particle < banana_particles.length; particle++) {
        // A return value of true indicates this particle is still alive
        if (banana_particles[particle].update(elapsed_time)) {
            aliveParticles.push(banana_particles[particle]);
        }
    }
    banana_particles = aliveParticles;

    aliveParticles = [];

    // Update death particles
    for (particle = 0; particle < death_particles.length; particle++) {
        // A return value of true indicates this particle is still alive
        if (death_particles[particle].update(elapsed_time)) {
            aliveParticles.push(death_particles[particle]);
        }
    }
    death_particles = aliveParticles;
}

function renderParticles(context) {
    for (
        let particle = banana_particles.length - 1;
        particle >= 0;
        particle--
    ) {
        let curr_particle = banana_particles[particle];
        if (curr_particle.image?.isReady) {
            let drawX = curr_particle.center.x - curr_particle.size.x / 2;
            let drawY = curr_particle.center.y - curr_particle.size.y / 2;
            let opacity = 1 - 2 * curr_particle.age;
            context.globalAlpha = Math.max(0, opacity);
            context.drawImage(
                curr_particle.image,
                drawX,
                drawY,
                curr_particle.size.x,
                curr_particle.size.y,
            );
            context.globalAlpha = 1;
        }
    }

    for (let particle = death_particles.length - 1; particle >= 0; particle--) {
        curr_particle = death_particles[particle];
        if (curr_particle.image?.isReady) {
            let drawX = curr_particle.center.x - curr_particle.size.x / 2;
            let drawY = curr_particle.center.y - curr_particle.size.y / 2;
            let opacity = 1 - curr_particle.age;
            context.globalAlpha = Math.max(0, opacity);
            context.drawImage(
                curr_particle.image,
                drawX,
                drawY,
                2 * curr_particle.size.x,
                2 * curr_particle.size.y,
            );
            context.globalAlpha = 1;
        }
    }
}
