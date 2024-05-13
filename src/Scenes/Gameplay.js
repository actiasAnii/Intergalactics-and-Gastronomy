myScore = 0;
highScore = 0;

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

        //initialize hp arrays
        this.my.sprite.fullHearts = [];
        this.my.sprite.emptyHearts = [];

        //configure arrays for waves of enemies
        this.waveNum = 0;
        this.waves = [
            //format: [#charas, #rigels, #enifs, #polluxes]
            [0, Phaser.Math.Between(0, 1), 0, Phaser.Math.Between(2, 5)], //wave 0
            [Phaser.Math.Between(0, 2), Phaser.Math.Between(1, 2), 1, 0], //wave 1
            [Phaser.Math.Between(1, 2), Phaser.Math.Between(0, 1), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2)], //wave 2
            [Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 3), Phaser.Math.Between(0, 2)], //wave 3

        ];

        //configure points for winflag to travel
        this.winPoints = [
            game.config.width/2, -20,
            game.config.width/2, game.config.height - 100
        ];

        this.gameEnd = false;
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
        this.load.image("healthEmpty", "health_empty.png");
        this.load.image("healthHalf", "health_half.png");
        this.load.image("healthFull", "health_full.png");

        //load flags
        this.load.image("flag1", "bg_flag_1.png");
        this.load.image("flag2", "bg_flag_2.png");


        //load yummy new font
        this.load.bitmapFont("minogram", "minogram_6x10.png", "minogram_6x10.xml");


        //load sound assets
        this.load.audio("playerShoot", "laserSmall_004.ogg");
        this.load.audio("enemyShoot", "laserSmall_000.ogg");
        this.load.audio("enemyDie", "explosionCrunch_000.ogg");
        this.load.audio("enemyHit", "jingles_NES14.ogg");
        this.load.audio("playerHit", "jingles_NES05.ogg");
        this.load.audio("waveStart", "jingles_NES16.ogg");
        this.load.audio("lostSound", "jingles_NES00.ogg");
        this.load.audio("wonSound", "jingles_NES08.ogg");
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


        //make player objects
        my.sprite.player = new Player(this, game.config.width/2, game.config.height - 40, "player1", null, this.left, this.right, 7);
        my.sprite.player.setScale(1.75);

        //initialize groups
        my.sprite.charas = this.add.group();
        my.sprite.rigels = this.add.group();
        my.sprite.enifs = this.add.group();
        my.sprite.polluxs = this.add.group();

        my.enemies = this.add.group();

        //add enemies to each group and add groups to enemies
        this.createEnemies("chara1", "pizza", 0, my.sprite.charas, 5);
        this.createEnemies("rigel1", "sushi", 1, my.sprite.rigels, 5);
        this.createEnemies("enif1", "musubi", 2, my.sprite.enifs, 5);
        this.createEnemies("pollux1", "burger", 3, my.sprite.polluxs, 10);

        my.enemies.addMultiple([my.sprite.charas, my.sprite.rigels, my.sprite.enifs, my.sprite.polluxs]);

         //create flag wave animation and path
         this.anims.create({
            key: "waveWin",
            frames: [
                { key: "flag1" },
                { key: "flag2" }
            ],
            frameRate: 20,
            repeat: 30,
            hideOnComplete: false
        });

        this.winPath = new Phaser.Curves.Spline(this.winPoints);
         

        //create blow up animation
        this.anims.create({
            key: "blowedUp",
            frames: [
                { key: "explode01" },
                { key: "explode02" },
                { key: "explode03" },
            ],
            frameRate: 20,
            repeat: 4,
            hideOnComplete: true
        });

        //make health bar
        for (let i = 0; i < 6; i++) {
            let fullHeart = this.add.sprite(0, 6, 'healthFull').setOrigin(0).setScale(1.5);
            let emptyHeart = this.add.sprite(0, 6, 'healthEmpty').setOrigin(0).setScale(1.5);

            fullHeart.visible = true;
            emptyHeart.visible = false;

            my.sprite.fullHearts.push(fullHeart);
            my.sprite.emptyHearts.push(emptyHeart);

            // Position the hearts horizontally
            const offsetX = i * (fullHeart.displayWidth + 2); // Adjust as needed
            fullHeart.x = offsetX;
            emptyHeart.x = offsetX;
        }


        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 7;
        this.bulletSpeed = 6;


        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Intergalactics & Gastronomy: Food Frenzy!!</h2><br>A: left // D: right // Space: fire/emit'


        // Put score on screen
        my.text.score = this.add.bitmapText(game.config.width-10, 40, "minogram", ("00000" + myScore).slice(-5)).setOrigin(1).setScale(3).setLetterSpacing(1);
        // Put wave number on screen
        my.text.wave = this.add.bitmapText(game.config.width/2, 20, "minogram", "WAVE: " + (this.waveNum + 1)).setOrigin(0.5).setScale(2.2).setLetterSpacing(1);
        // Put health on screen
        //my.text.tempHealth = this.add.bitmapText(0 + 10, 5, "minogram", "HEALTH: " + (my.sprite.player.health)).setOrigin(0).setScale(2.5);
        


        //init to reset game values
        this.init_game();
        
        //start first wave
        my.text.wave.setText("WAVE: " + (this.waveNum + 1));
        for (let i = 0; i < 4 ; i++){
            my.sprite.temp = my.enemies.getChildren()[i];
            for (let j = 0; j < this.waves[this.waveNum][i]; j++)
                {
                    my.sprite.temp.getChildren()[j].makeActive();
                }
         }

    }

    createEnemies(texture, projectileTexture, type, group, count)
    {
        for (let i = 0; i < count; i++)
            {
                    let enemy = new Enemy(this, Phaser.Math.Between(30, game.config.width - 30), -20, texture, null, projectileTexture, type, Phaser.Math.Between(0, 10));
                    group.add(enemy);
            }

    }

    //
    //helper functions for checking groups
    //get first inactive enemy in the group
    getFirstIA(group)
    {
        for (let enemy of group.getChildren()) {
        if (!enemy.active) {
            return enemy; // Return the first inactive enemy
        }
    }
    return null; // Return null if no inactive enemy is found
    }

    //get the first active enemy in the group
    getFirstA(group)
    {
        for (let enemy of group.getChildren()) {
        if (enemy.active) {
            return enemy; // Return the first active enemy
        }
    }
    return null; // Return null if no inactive enemy is found
    }

    allIA()
    {
        for (let enemyGroup of this.my.enemies.getChildren()){
            if (this.getFirstA(enemyGroup))
                {
                    return false;
                }
        }
        return true;
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


        // filter offscreen bullets
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
                            enemy.makeInactive();
                            // Update score
                            myScore += enemy.scorePoints;
                            this.updateScore();
                            // Play sound
                            this.sound.play("enemyDie", {volume: 0.25});}}
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
        my.enemies.getChildren().forEach((enemyGroup) => {
            for (let enemy of enemyGroup.getChildren()) {
                //check every element in bullet array with y > game.config.height - 70
                //check collides if true move bullet and reduce health
                for (let bullet of enemy.my.sprite.projectile)
                    {
                        if (bullet.y > game.config.height - 70 && this.collides (my.sprite.player, bullet))
                            {
                                bullet.y += 100;
                                this.updateHealth();
                            }

             }
            }
        });


        //if enemy passes player and goes offscreen, reduce health
        my.enemies.getChildren().forEach((enemyGroup) => {
            for (let enemy of enemyGroup.getChildren()) {
                if (enemy.y >= game.config.height + enemy.displayHeight/2)
                    {
                        console.log("made inactive");
                        enemy.makeInactive();
                        this.updateHealth();
                    }
            }
        });

        //move player bullet
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        //temp testing scenes transitions
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) 
        {
            this.sound.play("wonSound", {volume: 0.25});
            this.scene.start("endWin");
        }

        //if all enemies inactive, start the next wave
        if (this.allIA() && this.gameEnd == false){
            this.updateWave();
        }

        //if player.health <= 0, initiate loss
        if (my.sprite.player.health <= 0 && this.gameEnd == false)
            {
                this.loseGame();
            }
        
    }

    //
    //
    //helper functions for update


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

    updateHealth()
    {
        let my = this.my;
        my.sprite.player.health--;
        this.sound.play("playerHit", {volume: 0.25});
        //my.text.tempHealth.setText("HEALTH: " + my.sprite.player.health);
        for (let i = 0; i < 6; i++) {

            my.sprite.fullHearts[i].visible = i < my.sprite.player.health;
            my.sprite.emptyHearts[i].visible = i >= my.sprite.player.health;
        }

    }

    updateWave()
    {
        let my = this.my;

        this.sound.play("waveStart", {volume: 0.25});
        this.waveNum++;
            if (this.waveNum < 4){
            my.text.wave.setText("WAVE: " + (this.waveNum + 1));
            for (let i = 0; i < 4 ; i++){
                my.sprite.temp = my.enemies.getChildren()[i];
                for (let j = 0; j < this.waves[this.waveNum][i]; j++)
                    {
                        my.sprite.temp.getChildren()[j].makeActive();
                    }
             }
        } else {
            this.winGame();
        }
    }

    winGame()
    {
        this.gameEnd = true;
        // start follow animation on path
        this.waveFollower = this.add.follower(this.winPath, game.config.width/2, -10, "flag1").setScale(1.5);

        if (!this.waveFollower.isPlaying) {
        this.waveFollower.anims.play("waveWin");
        this.waveFollower.startFollow({
            from: 0,
            to: 1,
            delay: 1,
            duration: 3000,
            ease: 'Quadratic.easeInOut',
            repeat: 0,
            yoyo: false,
           });
        }

        //when animation is done, go to next scene
        this.waveFollower.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.sound.play("wonSound", {volume: 0.25});
            this.scene.start("endWin");
        }, 
        this);

    }

    loseGame()
    {
        this.gameEnd = true;
        this.sound.play("lostSound", {volume: 0.25});
        this.scene.start("endLose");
    }

    init_game()
    {
        let my = this.my;


        myScore = 0;
        this.updateScore();
        this.my.sprite.player.x = game.config.width/2;


        this.waveNum = 0;
        //reset waves
        this.waves = [
            //format: [#charas, #rigels, #enifs, #polluxes]
            [0, Phaser.Math.Between(0, 1), 0, Phaser.Math.Between(2, 5)], //wave 0
            [Phaser.Math.Between(0, 2), Phaser.Math.Between(1, 2), 1, 0], //wave 1
            [Phaser.Math.Between(1, 2), Phaser.Math.Between(0, 1), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2)], //wave 2
            [Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 3), Phaser.Math.Between(0, 2)], //wave 3

        ];

        this.gameEnd = false;
    }

}
       

         