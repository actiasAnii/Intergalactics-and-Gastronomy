class EndLose extends Phaser.Scene {
    constructor() {
        super("endLose");

        this.my = {sprite: {}, text: {}};
    }

    preload()
    {

    }

    create()
    {
        let my = this.my;

        this.fieldBackground = this.add.tileSprite(0, 0, 640, 1280, "grassField").setOrigin(0);

        this.nextScene = this.input.keyboard.addKey("N");

        if (myScore > highScore){
            highScore = myScore;

        }

        my.text.won = this.add.bitmapText(game.config.width/2, game.config.height/2 - 250, "minogram", "YOU LOST").setOrigin(0.5).setScale(4);
        my.text.reportScoreL = this.add.bitmapText(game.config.width/2, game.config.height/2 - 50, "minogram", "YOUR SCORE: " + ("00000" + myScore).slice(-5)).setOrigin(0.5).setScale(2.5);
        my.text.reportHighScoreL = this.add.bitmapText(game.config.width/2, game.config.height/2 + 50, "minogram", "HIGH SCORE: " + ("00000" + highScore).slice(-5)).setOrigin(0.5).setScale(2.5);
        my.text.playAgainL = this.add.bitmapText(game.config.width/2, game.config.height/2 + 200, "minogram", "press N to play again!").setOrigin(0.5).setScale(2.5);

    }

    update()
    {
        let my = this.my; 

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("gameplay");
        }
        
    }
}