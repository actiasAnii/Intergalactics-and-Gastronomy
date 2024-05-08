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

        this.nextScene = this.input.keyboard.addKey("N");

        my.text.won = this.add.bitmapText(400, 0, "rocketSquare", "you lost!");

    }

    update()
    {
        let my = this.my; 

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("gameplay");
        }
        
    }
}