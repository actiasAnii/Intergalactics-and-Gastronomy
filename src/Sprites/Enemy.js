//implementation of the enemy class
class Enemy extends Phaser.GameObjects.Sprite
{
    //predefined curve and path
    curve;
    path;
    constructor(scene, x, y, texture, frame, projectileTexture, type)
    {
        super(scene, x, y, texture, frame); //x,y start value and enemy texture

        //assign initial values

        this.projectileTexture = projectileTexture; //texture of enemy projectile
        this.type = type; //type of enemy; there are four types: chara, rigel, enif, pollux
        this.active = false; //initially set enemy active to false


        //handle enemy typing
        switch(type)
        {
            case 0: //chara
                this.projSpeed = 8; //speed at which this type of enemy's projectiles fly
                this.health = 1; //how many hits it takes for enemy to be destroyed
                this.baseHealth = 1; //preserve initial health even when other is modified
                this.scorePoints = 30; //how many points destroying this enemy give the player
                this.enemySpeed = Phaser.Math.Between(5500, 7000); //varies, allowing enemies to not all move at exact same pace
                this.repeat = 0;
                this.yoyo = false;

                //defines the points of this enemy's pathing. varies depending on type
                this.points = [ //moves in a zig zag across the screen, then descends to center of the bottom of the screen
                    x, y,
                    scene.game.config.width - 40, scene.game.config.height/4,
                    40, scene.game.config.height/2,
                    scene.game.config.width - 40, scene.game.config.height/2 + scene.game.config.height/4,
                    x, scene.game.config.height + this.displayHeight
                ];
                break;

            case 1: //rigel
                this.projSpeed = 10;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 10;
                this.enemySpeed = Phaser.Math.Between(2500, 3500);
                this.repeat = -1; //repeats and yoyos to allow smooth horizontal movement
                this.yoyo = true;

                this.points = [ //moves side to side across screen, never move down
                    30, y+50,
                    scene.game.config.width - 30, y+50
        
                ];
                break;


            case 2: //enif
                this.projSpeed = 7;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 25;
                this.enemySpeed = Phaser.Math.Between(8000, 10000);
                this.repeat = 0;
                this.yoyo = false;

                this.curvepoint;
                if (x <= scene.game.config.width/2)
                {
                    this.curvepoint = scene.game.config.width/2 - 20;
                }
                else
                {
                    this.curvepoint = -(scene.game.config.width/2 -20);
                }

                this.points = [ //moves in a curve down to center of the bottom of the screen
                x, y,
                x+this.curvepoint, scene.game.config.height/2,
                x+(this.curvepoint/2), scene.game.config.height+this.displayHeight
                ];
                
                 break;


            case 3: //pollux
                this.projSpeed = 6;
                this.health = 2;
                this.baseHealth = 3;
                this.scorePoints = 15;
                this.enemySpeed = Phaser.Math.Between(10000, 12000);
                this.repeat = 0;
                this.yoyo = false;

                this.points = [ //moves straight down from wherever starting x value was
                    x, y, 
                    x, this.displayHeight + scene.game.config.height
        
                ];
                break;
        }



        //set up for projectile array
        this.my = {sprite: {}};
        this.my.sprite.projectile = [];  
        this.maxproj = 20;

        //cooldown varies, creating more unpredictable shooting patterns (and less annoying sound effects)
        this.cooldown = Phaser.Math.Between(50, 100);

        //make curve and add sprite as follower
        this.curve = new Phaser.Curves.Spline(this.points);
        this.my.sprite.enemy = scene.add.follower(this.curve, x, y, this.texture).setScale(1.5);

        //set sprite follower to inactive and invisible
        this.my.sprite.enemy.active = false;
        this.my.sprite.enemy.visible = false;


        return this;
    }




    update()
    {
        let my = this.my;

        //make projectiles move, even if enemy isnt active anymore
        for (let projectile of my.sprite.projectile) {
            projectile.y += this.projSpeed;
        }

        //make x and y values match the follower
        this.x = my.sprite.enemy.x;
        this.y = my.sprite.enemy.y;

        //only if enemy is active
        if (this.active == true){

        //reduce cooldown
        this.cooldown--;


        //make enemy shoot
        if (this.cooldown <= 0) //after cooldown time has passed
            {
                if (my.sprite.projectile.length < this.maxproj) {
                    my.sprite.projectile.push(this.scene.add.sprite( //push new projectile to enemy projectile array
                        this.x, this.y-(this.displayHeight/2), this.projectileTexture).setScale(1)
                    ); 

                    //play a sound to signify enemy shooting
                    this.scene.sound.play("enemyShoot", {
                        volume: 0.25
                    });
                    //reset cooldown to another random number
                    this.cooldown = Phaser.Math.Between(50, 100);
                }
            }


        //remove invalid projectiles
        my.sprite.projectile = my.sprite.projectile.filter((projectile) => {
            if (projectile.y >= this.scene.game.config.height + this.displayHeight/2)
                {
                    projectile.destroy();
                }
            return projectile.y < this.scene.game.config.height + this.displayHeight/2;
        });
        }


    }


    //class method to make enemy active
    makeActive()
    {
        //set active variable true
        this.my.sprite.enemy.active = true;
        this.active = true;

        //reset position to start of path
        this.x = this.curve.points[0].x;
        this.y = this.curve.points[0].y;
        this.my.sprite.enemy.setPosition(this.curve.points[0].x, this.curve.points[0].y);

        //make enemy sprite visible
        this.my.sprite.enemy.visible = true;

        //reset health
        this.health = this.baseHealth;

        //make enemy sprite follow the defined path
        this.my.sprite.enemy.startFollow({
            from: 0,
            to: 1,
            delay: 1,
            duration: this.enemySpeed,
            ease: 'Quadratic.easeInOut',
            repeat: this.repeat,
            yoyo: this.yoyo,
           });
    }

    //class method to make enemy inactive
    makeInactive()
    {
        //set active variable to false
        this.my.sprite.enemy.active = false;
        this.active = false;

        //make enemy stop following path and move them offscreen
        this.my.sprite.enemy.stopFollow();
        this.my.sprite.enemy.y = -100;

        //make enemy invisible
        this.my.sprite.enemy.visible = false;
    }


}
