class Gameplay extends Phaser.Scene {
    constructor() 
    {
        super("gameplay");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 30;           // Don't create more than this many bullets
        
        this.myScore = 0;       // record a score as a class variable
    }

    preload() 
    {
        //load assets
        this.load.setPath("./assets/");

        //player animation + bullet
        this.load.image("player1", "player_1.png");
        this.load.image("player2", "player_2.png");
        this.load.image("donut", "bullet_donut.png");

        //chara animation + projectile
        this.load.image("chara1", "enemy_chara_1.png");
        this.load.image("chara2", "enemy_chara_2.png");
        this.load.image("pizza", "bullet_pizza.png");

        //rigel animation + projectile
        this.load.image("rigel1", "enemy_rigel_1.png");
        this.load.image("rigel2", "enemy_rigel_2.png");
        this.load.image("sushi", "bullet_sushi.png");


        //enif animation + projectile
        this.load.image("enif1", "enemy_enif_1.png");
        this.load.image("enif2", "enemy_enif_2.png");
        this.load.image("musubi", "bullet_musubi.png");

        //pollux animation + projectile
        this.load.image("pollux1", "enemy_pollux_1.png");
        this.load.image("pollux2", "enemy_pollux_2.png");
        this.load.image("burger", "bullet_burger.png");



        //for death animation
        this.load.image("explode01", "explosion_1.png");
        this.load.image("explode02", "explosion_2.png");
        this.load.image("explode03", "explosion_3.png");

        //load stuff for background later
        this.load.image("grassField", "GrassField.png");

        //load health

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound assets
        this.load.audio("playerShoot", "laserSmall_004.ogg");
        this.load.audio("enemyShoot", "laserSmall_000.ogg");
        this.load.audio("deathNoise", "explosionCrunch_000.ogg");
    }

    create() {
        let my = this.my;

        // add background
        this.fieldBackground = this.add.tileSprite(0, 0, 640, 1280, "grassField").setOrigin(0).setScrollFactor(0, 1);

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("N");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //make player and enemy objects
        my.sprite.player = new Player(this, game.config.width/2, game.config.height - 40, "player1", null, this.left, this.right, 5);
        my.sprite.player.setScale(1.75);

        my.sprite.chara = this.add.sprite(game.config.width/2, 60, "chara1"); //check how to randomize spawn location
        my.sprite.chara.setScale(1.5);
        my.sprite.chara.scorePoints = 25;

        //add additional enemies. can configure here? //think about adding every sprite to a group and adding each group to another group

        // Create white blow up animation
        this.anims.create({
            key: "blowedUp",
            frames: [
                { key: "explode01" },
                { key: "explode02" },
                { key: "explode03" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 4,
            hideOnComplete: true
        });

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 7;
        this.bulletSpeed = 6;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Gameplay.js</h2><br>A: left // D: right // Space: fire/emit // N: Next Scene'

        // Put score on screen
        my.text.score = this.add.bitmapText(460, 0, "rocketSquare", ("00000" + this.myScore).slice(-5));

        // Put title on screen 
        /*
        this.add.text(10, 5, "Hippo Hug!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });
        */

        //init to reset game values
        this.init_game();

    }

    update() {
        let my = this.my;

        this.fieldBackground.tilePositionY -= 5;

        my.sprite.player.update();

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "donut").setScale(1.5)
                );
            }
            this.sound.play("playerShoot", {
                volume: 0.25
            });
        }

        // Remove all of the bullets which are offscreen
        // filter() goes through all of the elements of the array, and
        // only returns those which **pass** the provided test (conditional)
        // In this case, the condition is, is the y value of the bullet
        // greater than zero minus half the display height of the bullet? 
        // (i.e., is the bullet fully offscreen to the top?)
        // We store the array returned from filter() back into the bullet
        // array, overwriting it. 
        // This does have the impact of re-creating the bullet array on every 
        // update() call. 
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Check for collision with the enemy
        for (let bullet of my.sprite.bullet) {
            if (this.collides(my.sprite.chara, bullet)) {
                // start animation
                this.blowedUp = this.add.sprite(my.sprite.chara.x, my.sprite.chara.y, "explode01").setScale(1.75).play("blowedUp");
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                my.sprite.chara.visible = false;
                my.sprite.chara.x = -100;
                // Update score
                this.myScore += my.sprite.chara.scorePoints;
                this.updateScore();
                // Play sound
                this.sound.play("deathNoise", {
                    volume: 0.25   // Can adjust volume using this, goes from 0 to 1
                });
                // Have new hippo appear after end of animation
                //alter for my enemy waves
                this.blowedUp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.my.sprite.chara.visible = true;
                    this.my.sprite.chara.x = Math.random() * config.width;
                }, this);

            }
        }


        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("endWin");
        }

    }

    // A center-radius AABB collision check
    collides(a, b) 
    {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() 
    {
        let my = this.my;
        my.text.score.setText(("00000" + this.myScore).slice(-5));
    }

    init_game()
    {
        let my = this.my;

        this.myScore = 0;
        this.updateScore();
        this.my.sprite.player.x = game.config.width/2;

    }

}
         