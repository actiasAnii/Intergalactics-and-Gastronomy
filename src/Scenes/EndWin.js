class EndWin extends Phaser.Scene {
    constructor() 
    {
        super("endWin");

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

        my.text.won = this.add.bitmapText(game.config.width/2, game.config.height/2 - 200, "minogram", "YOU WON!").setOrigin(0.5).setScale(4);
        my.text.reportScoreW = this.add.bitmapText(game.config.width/2, game.config.height/2, "minogram", "SCORE: " + ("00000" + myScore).slice(-5)).setOrigin(0.5).setScale(2.5);
        my.text.playAgainW = this.add.bitmapText(game.config.width/2, game.config.height/2 + 200, "minogram", "press N to play again!").setOrigin(0.5).setScale(2.5);

    }

    update()
    {
        let my = this.my;

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("endLose");
        }

    }
}