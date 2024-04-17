const SINGLE_SPRITE_COUNT = 8;
const BUNCH_SPRITE_COUNT = 12;

const yellowBunch = new Image();
const redBunch = new Image();
const blueBunch = new Image();
const purpleBunch = new Image();
const greenBunch = new Image();

const yellowSingle = new Image();
const redSingle = new Image();
const blueSingle = new Image();
const purpleSingle = new Image();
const greenSingle = new Image();

yellowSingle.onload = function () {
    yellowSingle.isReady = true;
    yellowSingle.subTextureWidth = yellowSingle.width / SINGLE_SPRITE_COUNT;
};
yellowSingle.src = "assets/spritesheet-bananaYellowSingle.png";

redSingle.onload = function () {
    redSingle.isReady = true;
    redSingle.subTextureWidth = redSingle.width / SINGLE_SPRITE_COUNT;
};
redSingle.src = "assets/spritesheet-bananaRedSingle.png";

blueSingle.onload = function () {
    blueSingle.isReady = true;
    blueSingle.subTextureWidth = blueSingle.width / SINGLE_SPRITE_COUNT;
};
blueSingle.src = "assets/spritesheet-bananaBlueSingle.png";

purpleSingle.onload = function () {
    purpleSingle.isReady = true;
    purpleSingle.subTextureWidth = purpleSingle.width / SINGLE_SPRITE_COUNT;
};
purpleSingle.src = "assets/spritesheet-bananaPurpleSingle.png";

greenSingle.onload = function () {
    greenSingle.isReady = true;
    greenSingle.subTextureWidth = greenSingle.width / SINGLE_SPRITE_COUNT;
};
greenSingle.src = "assets/spritesheet-bananaGreenSingle.png";

let singleColorImages = [
    yellowSingle,
    redSingle,
    blueSingle,
    purpleSingle,
    greenSingle,
];
let bunchColorImages = [
    yellowBunch,
    redBunch,
    blueBunch,
    purpleBunch,
    greenBunch,
];
