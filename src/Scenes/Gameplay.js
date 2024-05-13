//global variables holding current score and high score, displayed on end/win screens
myScore = 0;
highScore = 0;

//main gameplay scene
class Gameplay extends Phaser.Scene {
    constructor()
    {
        super("gameplay");


        // initialize a class variable "my" which is an object
        // the object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        //initialize bullet array
        this.my.sprite.bullet = [];  
        this.maxBullets = 30;

        //initialize hp displaying arrays
        this.my.sprite.fullHearts = [];
        this.my.sprite.emptyHearts = [];

        //store current wave
        this.waveNum = 0; 

        //create matrix holding enemy wave configurations
        this.waves = [
            //format: [# of charas, # of rigels, # of enifs, # of polluxes]
            [0, Phaser.Math.Between(0, 1), 0, Phaser.Math.Between(2, 5)], //wave 0
            [Phaser.Math.Between(0, 2), Phaser.Math.Between(1, 2), 1, 0], //wave 1
            [Phaser.Math.Between(1, 2), Phaser.Math.Between(0, 1), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2)], //wave 2
            [Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 3), Phaser.Math.Between(0, 2)], //wave 3

        ];

        //configure points for the winflag path
        this.winPoints = [ //descends down center of screen to just above player y
            game.config.width/2, -20,
            game.config.width/2, game.config.height - 100
        ];

        //game is not in the middle of an ending sequence
        this.gameEnd = false;
    }


    preload()
    {
        //load assets
        this.load.setPath("./assets/");


        //player + bullet
        this.load.image("player1", "player_1.png");
        this.load.image("donut", "bullet_donut.png");


        //chara + projectile
        this.load.image("chara1", "enemy_chara_1.png");
        this.load.image("pizza", "bullet_pizza.png");


        //rigel + projectile
        this.load.image("rigel1", "enemy_rigel_1.png");
        this.load.image("sushi", "bullet_sushi.png");


        //enif + projectile
        this.load.image("enif1", "enemy_enif_1.png");
        this.load.image("musubi", "bullet_musubi.png");


        //pollux + projectile
        this.load.image("pollux1", "enemy_pollux_1.png");
        this.load.image("burger", "bullet_burger.png");


        //enemy death animation frames
        this.load.image("explode01", "explosion_1.png");
        this.load.image("explode02", "explosion_2.png");
        this.load.image("explode03", "explosion_3.png");


        //background image
        this.load.image("grassField", "GrassField.png");


        //health bar
        this.load.image("healthEmpty", "health_empty.png");
        this.load.image("healthFull", "health_full.png");

        //flag animation frames
        this.load.image("flag1", "bg_flag_1.png");
        this.load.image("flag2", "bg_flag_2.png");

        //yummy new font
        this.load.bitmapFont("minogram", "minogram_6x10.png", "minogram_6x10.xml");


        //sound assets
        this.load.audio("playerShoot", "laserSmall_004.ogg"); //sound that plays when player fires
        this.load.audio("enemyShoot", "laserSmall_000.ogg"); //sound that plays when enemy fires
        this.load.audio("enemyDie", "explosionCrunch_000.ogg"); //sound that plays during enemy death animation
        this.load.audio("enemyHit", "jingles_NES14.ogg"); //sound that plays when enemy is hit by a player bullet
        this.load.audio("playerHit", "jingles_NES05.ogg"); //sound that plays when player is hit by a enemy projectile
        this.load.audio("waveStart", "jingles_NES16.ogg"); //sound that plays when a new wave starts
        this.load.audio("lostSound", "jingles_NES00.ogg"); //sound that plays when transitioning to the lose screen
        this.load.audio("wonSound", "jingles_NES08.ogg"); //sound that plays when transitioning to the win screen 
    }


    create() {
        let my = this.my;


        //add background
        this.fieldBackground = this.add.tileSprite(0, 0, 640, 1280, "grassField").setOrigin(0).setScrollFactor(0, 1);


        //create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("N");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        //make player object
        my.sprite.player = new Player(this, game.config.width/2, game.config.height - 40, "player1", null, this.left, this.right, 7).setScale(1.75);

        //initialize enemy groups
        my.sprite.charas = this.add.group();
        my.sprite.rigels = this.add.group();
        my.sprite.enifs = this.add.group();
        my.sprite.polluxs = this.add.group();

        //initialize group of all enemy type groups
        my.enemies = this.add.group();

        //add enemies to each group
        this.createEnemies("chara1", "pizza", 0, my.sprite.charas, 5);
        this.createEnemies("rigel1", "sushi", 1, my.sprite.rigels, 5);
        this.createEnemies("enif1", "musubi", 2, my.sprite.enifs, 5);
        this.createEnemies("pollux1", "burger", 3, my.sprite.polluxs, 10);

        //add groups to enemies
        my.enemies.addMultiple([my.sprite.charas, my.sprite.rigels, my.sprite.enifs, my.sprite.polluxs]);

         //create flag wave animation
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

        //create flage wave path
        this.winPath = new Phaser.Curves.Spline(this.winPoints);
         

        //create enemy blow up animation
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

        //create health bar
        for (let i = 0; i < 6; i++) {
            //new sprite for both empty and full arrays
            let fullHeart = this.add.sprite(0, 6, 'healthFull').setOrigin(0).setScale(1.5);
            let emptyHeart = this.add.sprite(0, 6, 'healthEmpty').setOrigin(0).setScale(1.5);

            fullHeart.visible = true; //start with full hearts visible
            emptyHeart.visible = false;

            //push sprites to corresponding arrays
            my.sprite.fullHearts.push(fullHeart);
            my.sprite.emptyHearts.push(emptyHeart);

            //position the hearts horizontally
            const offsetX = i * (fullHeart.displayWidth + 2);
            fullHeart.x = offsetX;
            emptyHeart.x = offsetX;
        }


        //set movement speeds (in pixels/tick)
        this.playerSpeed = 7;
        this.bulletSpeed = 6;


        //update HTML description
        document.getElementById('description').innerHTML = '<h2>Intergalactics & Gastronomy: Food Frenzy!!</h2><br>A: left // D: right // Space: fire/emit'


        //put score on screen
        my.text.score = this.add.bitmapText(game.config.width-10, 40, "minogram", ("00000" + myScore).slice(-5)).setOrigin(1).setScale(3).setLetterSpacing(1);
        // Put wave number on screen
        my.text.wave = this.add.bitmapText(game.config.width/2, 20, "minogram", "WAVE: " + (this.waveNum + 1)).setOrigin(0.5).setScale(2.2).setLetterSpacing(1);
        


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






    //helper function for making enemies
    createEnemies(texture, projectileTexture, type, group, count)
    {
        for (let i = 0; i < count; i++)
            {
                let enemy = new Enemy(this, Phaser.Math.Between(30, game.config.width - 30), -20, texture, null, projectileTexture, type); //create new enemy offscreen at random x value
                group.add(enemy); //add to group
            }

    }

    //get first inactive enemy in the group
    getFirstIA(group)
    {
        for (let enemy of group.getChildren()) {
        if (!enemy.active) {
            return enemy; //return the first inactive enemy
        }
    }
    return null; //return null if no inactive enemy is found
    }

    //get the first active enemy in the group
    getFirstA(group)
    {
        for (let enemy of group.getChildren()) {
        if (enemy.active) {
            return enemy; //return the first active enemy
        }
    }
    return null; //return null if no inactive enemy is found
    }

    //check if all enemies are inactive
    allIA()
    {
        for (let enemyGroup of this.my.enemies.getChildren()){
            if (this.getFirstA(enemyGroup))
                {
                    return false; //if any are active, return false
                }
        }
        return true;
    }






    update() {
        let my = this.my;


        //scroll the background
        this.fieldBackground.tilePositionY -= 5;


        //handle player movement
        my.sprite.player.update();


        //check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            //if under the bullet max
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite( //push sprite to bullet array
                    my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "donut").setScale(1.5)
                );
            }
            this.sound.play("playerShoot", {
                volume: 0.25
            });
        }


        //remove offscreen bullets
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));


        //evilest
        //check for bullet collision with the enemy
        for (let bullet of my.sprite.bullet) {
            my.enemies.getChildren().forEach((enemyGroup) => {
                for (let enemy of enemyGroup.getChildren()) { //iterating over every enemy in every group
                    if (enemy.active == true && this.collides(enemy, bullet)) { //if enemy is active and hit by a player bullet
                        enemy.health--; //reduce enemy health
                        bullet.y = -100; //move bullet offscreen to be destroyed
                        this.sound.play("enemyHit", {volume: 0.1});

                        //if collision reduces enemy health to 0
                        if (enemy.health == 0){
                            //start animation
                            this.blowedUp = this.add.sprite(enemy.x, enemy.y, "explode01").setScale(1.75).play("blowedUp");
                            //make enemy inactive
                            enemy.makeInactive();
                            //update score
                            myScore += enemy.scorePoints;
                            this.updateScore();

                            this.sound.play("enemyDie", {volume: 0.25});}}
                            }
             });
        }

        //run enemy update function on every enemy
        my.enemies.getChildren().forEach((enemyGroup) => {
            for (let enemy of enemyGroup.getChildren()) {
                enemy.update();
            }
        });

        //check for enemy projectile collision with player
        my.enemies.getChildren().forEach((enemyGroup) => {
            for (let enemy of enemyGroup.getChildren()) {
                for (let proj of enemy.my.sprite.projectile)
                    {
                        if (proj.y > game.config.height - 70 && this.collides (my.sprite.player, proj)) //sweep only projectiles close to player, check if collides 
                            {
                                proj.y += 100; //move projectile offscreen
                                this.updateHealth(); //reduce player health
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

        //move player bullets
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        //if all enemies inactive, start the next wave
        if (this.allIA() && this.gameEnd == false){
            this.updateWave();
        }

        //if player.health <= 0, initiate loss sequence
        if (my.sprite.player.health <= 0 && this.gameEnd == false)
            {
                this.loseGame();
            }
        
    }





    //center-radius AABB collision check
    collides(a, b)
    {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    //update displayed score
    updateScore()
    {
        let my = this.my;
        my.text.score.setText(("00000" + myScore).slice(-5)); //update display
    }

    //reduce health and update health bar
    updateHealth()
    {
        let my = this.my;
        my.sprite.player.health--;
        this.sound.play("playerHit", {volume: 0.25});

        //for each element in the health bar arrays
        for (let i = 0; i < 6; i++) {

            my.sprite.fullHearts[i].visible = i < my.sprite.player.health; //if i is less than current player health, full heart is visible
            my.sprite.emptyHearts[i].visible = i >= my.sprite.player.health; //if i is greater than current player health, empty heart is visible
        }

    }

    //start the next wave and update displayed wave
    updateWave()
    {
        let my = this.my;

        this.sound.play("waveStart", {volume: 0.25});
        this.waveNum++; //increase wave number

            if (this.waveNum < 4){ //only four waves in this game
            my.text.wave.setText("WAVE: " + (this.waveNum + 1)); //update display

            //activate enemies defined in waves configuration matrix
            for (let i = 0; i < 4 ; i++){
                my.sprite.temp = my.enemies.getChildren()[i];
                for (let j = 0; j < this.waves[this.waveNum][i]; j++)
                    {
                        my.sprite.temp.getChildren()[j].makeActive();
                    }
             }
        } else { //if four waves completed, initiated win sequence
            this.winGame();
        }
    }


    //win sequence
    winGame()
    {
        //clarify that ending sequence is happening so it doesnt run more than once
        this.gameEnd = true;

        //make flag animation follow winPath
        this.waveFollower = this.add.follower(this.winPath, game.config.width/2, -10, "flag1").setScale(1.5);

        //play animation and have it follow the path
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

        //when animation is done, go to won screen
        this.waveFollower.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.sound.play("wonSound", {volume: 0.25});
            this.scene.start("endWin");
        }, 
        this);

    }

    //loss sequence
    loseGame()
    {
        //clarify that ending sequence is happening so it doesnt run more than once
        this.gameEnd = true;

        this.sound.play("lostSound", {volume: 0.25});
        //go to lost screen
        this.scene.start("endLose");
    }

    //reset game values
    init_game()
    {
        let my = this.my;

        //set current score to zero
        myScore = 0;
        this.updateScore();
        
        //reset player position
        this.my.sprite.player.x = game.config.width/2;

        //reset current wave
        this.waveNum = 0;

        //create new wave configurations
        this.waves = [
            //format: [#charas, #rigels, #enifs, #polluxes]
            [0, Phaser.Math.Between(0, 1), 0, Phaser.Math.Between(2, 5)], //wave 0
            [Phaser.Math.Between(0, 2), Phaser.Math.Between(1, 2), 1, 0], //wave 1
            [Phaser.Math.Between(1, 2), Phaser.Math.Between(0, 1), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2)], //wave 2
            [Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 3), Phaser.Math.Between(0, 2)], //wave 3

        ];

        //ending sequence is no longer occuring
        this.gameEnd = false;
    }



    
}
       

         