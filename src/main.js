// Anais Montes
// Created: 05/2024
// Phaser: 3.70.0
//
// Intergalactics & Gastronomy: Food Frenzy!!
//
// A silly gallery shooter game themed around aliens having a food fight :)
//
//
//
// Credits:
//
// art: 
// -Kenny Pixel Platformer (https://kenney.nl/assets/pixel-platformer)
// -Kenny Pixel Platformer Food Expansion (https://kenney.nl/assets/pixel-platformer-food-expansion)
// -Kenny Pixel Shmup (https://kenney.nl/assets/pixel-shmup)
//
// audio:
// - Kenny Sci Fi Sounds (https://kenney.nl/assets/sci-fi-sounds)
// - Kenny Music Jingles (https://kenney.nl/assets/music-jingles)
//
// font: FrostyFreeze Public Domain Bitmap Minogram 6x10 (https://frostyfreeze.itch.io/pixel-bitmap-fonts-png-xml)
//
// basic template forked from Jim Whitehead's Bullet Time (https://github.com/JimWhiteheadUCSC/BulletTime/tree/master)

//debug with extreme prejudice
"use strict"

//game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  //prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },   //ensure consistent timing across machines
    width: 600,
    height: 800,
    scene: [Gameplay, EndWin, EndLose]
}


const game = new Phaser.Game(config);