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

        this.nextScene = this.input.keyboard.addKey("N");

        my.text.won = this.add.bitmapText(420, 0, "rocketSquare", "you won!");

    }

    update()
    {
        let my = this.my;

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("endLose");
        }

    }
}