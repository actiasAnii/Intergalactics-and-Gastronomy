class Enemy extends Phaser.GameObjects.Sprite
{
    curve;
    path;
    constructor(scene, x, y, texture, frame, projectileTexture, type, offset) //can handle most of these in a type switch!!
    {
        super(scene, x, y, texture, frame);
        //assign input values
        this.projectileTexture = projectileTexture;
        this.type = type;
        this.active = false;
        this.offset = offset;


        //handle enemy typing
        switch(type)
        {
            case 0: //chara
                this.projSpeed = 8;
                this.health = 1;
                this.baseHealth = 1;
                this.scorePoints = 30;
                this.enemySpeed = Phaser.Math.Between(6500, 8000);
                this.repeat = 0;
                this.yoyo = false;

                this.points = [
                    x, y,
                    scene.game.config.width - 20, scene.game.config.height/4,
                    20, scene.game.config.height/2,
                    scene.game.config.width - 20, scene.game.config.height/2 + scene.game.config.height/4,
                    x, scene.game.config.height + this.displayHeight
        
                ];
                break;

            case 1: //rigel
                this.projSpeed = 10;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 15;
                this.enemySpeed = Phaser.Math.Between(2500, 3500);
                this.repeat = -1;
                this.yoyo = true;

                this.points = [
                    30, y+50,
                    scene.game.config.width - 30, y+50
        
                ];
                break;


            case 2: //enif
                this.projSpeed = 7;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 25;
                this.enemySpeed = Phaser.Math.Between(6500, 9000);
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

                this.points = [
                x, y,
                x+this.curvepoint, scene.game.config.height/2,
                x+(this.curvepoint/2), scene.game.config.height+this.displayHeight
                ];
                
                 break;


            case 3: //pollux
                this.projSpeed = 6;
                this.health = 2;
                this.baseHealth = 3;
                this.scorePoints = 10;
                this.enemySpeed = Phaser.Math.Between(8000, 10000);
                this.repeat = 0;
                this.yoyo = false;

                this.points = [
                    x, y, 
                    x, this.displayHeight + scene.game.config.height
        
                ];
                break;
        }



        //set up for projectile array
        this.my = {sprite: {}};
        this.my.sprite.projectile = [];  
        this.maxproj = 20;

        this.cooldown = Phaser.Math.Between(35, 60);

        //make appropriate curve and add sprite as follower
        this.curve = new Phaser.Curves.Spline(this.points);
       
        this.my.sprite.enemy = scene.add.follower(this.curve, x, y, this.texture).setScale(1.5);

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

        this.x = my.sprite.enemy.x;
        this.y = my.sprite.enemy.y;

        if (this.active == true){

        //reduce cooldown
        this.cooldown--;


        //make enemy shoot!
        if (this.cooldown <= 0)
            {
                if (my.sprite.projectile.length < this.maxproj) {
                    my.sprite.projectile.push(this.scene.add.sprite(
                        this.x, this.y-(this.displayHeight/2), this.projectileTexture).setScale(1.25)
                    );


                    this.scene.sound.play("enemyShoot", {
                        volume: 0.25
                    });
                    this.cooldown = 50;
                }
            }


        //remove invalid projectiles
        my.sprite.projectile = my.sprite.projectile.filter((projectile) => {
            if (projectile.y >= this.scene.game.config.height + this.displayHeight/2)
                {
                    projectile.destroy(); //idk if this is doing anything.....
                }
            return projectile.y < this.scene.game.config.height + this.displayHeight/2;
        });
        }

        //make inactive if outside of bounds

        if (this.y >= this.scene.game.config.height + this.displayHeight/2)
            {
                this.makeInactive();
            }


    }


    makeActive()
    {
        this.my.sprite.enemy.active = true;
        this.active = true;
        this.x = this.curve.points[0].x;
        this.y = this.curve.points[0].y;
        this.my.sprite.enemy.setPosition(this.curve.points[0].x, this.curve.points[0].y);
        this.my.sprite.enemy.visible = true;
        this.health = this.baseHealth;


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


    makeInactive()
    {
        this.my.sprite.enemy.active = false;
        this.active = false;
        this.my.sprite.enemy.stopFollow();
        this.my.sprite.enemy.visible = false;
        this.my.sprite.enemy.y = -100;


    }


}
