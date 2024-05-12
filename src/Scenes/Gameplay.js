myScore = 0

class Gameplay extends Phaser.Scene {
    constructor()
    {
        super("gameplay");


        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        //initialize bullet array
        this.my.sprite.bullet = [];  
        this.maxBullets = 30;
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



        //
        //for death animation
        this.load.image("explode01", "explosion_1.png");
        this.load.image("explode02", "explosion_2.png");
        this.load.image("explode03", "explosion_3.png");


        //load background image
        this.load.image("grassField", "GrassField.png");


        //load health


        //load yummy new font
        this.load.bitmapFont("minogram", "minogram_6x10.png", "minogram_6x10.xml");


        //load sound assets
        this.load.audio("playerShoot", "laserSmall_004.ogg");
        this.load.audio("enemyShoot", "laserSmall_000.ogg");
        this.load.audio("deathNoise", "explosionCrunch_000.ogg");
        this.load.audio("enemyHit", "forceField_002.ogg");
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


        //my.sprite.chara = new Enemy(this, game.config.width/2, 30, "chara1", null, "pizza", 3);
        //my.sprite.chara.makeActive();
        //make groups
        //initialize groups
        my.sprite.charas = this.add.group();
        my.sprite.rigels = this.add.group();
        my.sprite.enifs = this.add.group();
        my.sprite.polluxs = this.add.group();

        my.enemies = this.add.group();

        //add enemies to each group and add groups to enemies
        this.createEnemies("chara1", "pizza", 0, my.sprite.charas, 10);
        this.createEnemies("rigel1", "sushi", 1, my.sprite.rigels, 10 );
        this.createEnemies("enif1", "musubi", 2, my.sprite.enifs, 10);
        this.createEnemies("pollux1", "burger", 3, my.sprite.polluxs, 10);

        my.enemies.addMultiple([my.sprite.charas, my.sprite.rigels, my.sprite.enifs, my.sprite.polluxs]);

        my.enemies.getChildren().forEach((enemyGroup) => {
            my.sprite.test = this.getFirstIA(enemyGroup); 
            if (my.sprite.test != null){
                my.sprite.test.makeActive();

            } else{
                console.log("failed...")
            }
            });

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
        my.text.score = this.add.bitmapText(game.config.width-10, 30, "minogram", ("00000" + myScore).slice(-5)).setOrigin(1).setScale(2.5);

        //init to reset game values
        this.init_game();


    }

    createEnemies(texture, projectileTexture, type, group, count)
    {
        console.log('Creating enemies...');
        for (let i = 0; i < count; i++)
            {
                    let enemy = new Enemy(this, Phaser.Math.Between(30, game.config.width - 30), 30, texture, null, projectileTexture, type);
                    if (enemy) {
                        group.add(enemy);
                        console.log('Enemy added to group');
                    } else {
                        console.log('Failed to create enemy.');
                    }
            }

    }

    //omfg it works thank fucking god
    getFirstIA(group)
    {
        for (let enemy of group.getChildren()) {
        if (!enemy.active) {
            return enemy; // Return the first inactive enemy
        }
    }
    return null; // Return null if no inactive enemy is found
    }



    //add iteratives
    update() {
        let my = this.my;


        //scroll the background
        this.fieldBackground.tilePositionY -= 5;


        //handle player movement
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


        //evilest
        // Check for bullet collision with the enemy
        for (let bullet of my.sprite.bullet) {
            my.enemies.getChildren().forEach((enemyGroup) => {
                for (let enemy of enemyGroup.getChildren()) {
                    if (enemy.active == true && this.collides(enemy, bullet)) {
                        enemy.health--;
                        bullet.y = -100;
                        this.sound.play("enemyHit", {volume: 0.1});
                        //if collision reduces enemy health to 0
                        if (enemy.health == 0){
                            // start animation
                            this.blowedUp = this.add.sprite(enemy.x, enemy.y, "explode01").setScale(1.75).play("blowedUp");
                            // clear out bullet -- put y offscreen, will get reaped next update
                            my.sprite.hehe = this.getFirstIA(enemyGroup);
                            enemy.makeInactive();
                            // Update score
                            myScore += enemy.scorePoints;
                            this.updateScore();
                            // Play sound
                            this.sound.play("deathNoise", {volume: 0.25});
                            // Have new enemy appear after end of animation
                            //alter for my enemy waves
                            this.blowedUp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                                my.sprite.hehe.makeActive();
                            }, 
                            this);}}
                            }
             });
        }

        //run enemy update function
        my.enemies.getChildren().forEach((enemyGroup) => {
            for (let enemy of enemyGroup.getChildren()) {
                enemy.update();
            }
        });

        //check for enemy projectile collision with player


        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }


        //temp testing scenes transitions
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
        my.text.score.setText(("00000" + myScore).slice(-5));
    }


    init_game()
    {
        let my = this.my;


        myScore = 0;
        this.updateScore();
        this.my.sprite.player.x = game.config.width/2;


        //probably add initial configuration for enemies? or generate it? once i get waves working


    }

}
       

         