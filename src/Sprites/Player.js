//implementation of player class
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed) {
        super(scene, x, y, texture, frame); //x, y start value and player texture

        this.left = leftKey; //key for moving left
        this.right = rightKey; //key for moving right
        this.playerSpeed = playerSpeed; //player movement speed
        
        this.health = 6; //player health

        scene.add.existing(this);

        return this;
    }

    update() {//handles player movement

        //key is pressed to make move left
        if (this.left.isDown) {
            //check to make sure the sprite can move left without going offscreen
            if (this.x > (this.displayWidth/2)) {
                this.x -= this.playerSpeed;
            }
        }

        //key is pressed to make move right
        if (this.right.isDown) {
            //check to make sure sprite can move right without going offscreen
            if (this.x < (game.config.width - (this.displayWidth/2))) {
                this.x += this.playerSpeed;
            }
        }
    }

}