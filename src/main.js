let config = {
    type: Phaser.CANVAS,
    width: 900,
    height: 900,
    scene: [ Menu, Skills, City, Battle, BossBattle]
}

let game = new Phaser.Game(config);
let WIDTH = game.config.width;
let HEIGHT = game.config.height;

let keyUP, keySPACE;

// Main conditionals for choosing scenes
let DAY = 14;

let MONEY = 0;
let REWARD = 10;

// Consumable items tracker
let REDPOTION = 0;
let BLUEPOTION = 0;

let END = 20;
let STR = 20;
let WIT = 20;
let DEX = 20;
