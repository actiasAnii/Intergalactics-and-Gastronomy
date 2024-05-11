class Enemy extends Phaser.GameObjects.Sprite
{
    curve;
    path;
    constructor(scene, x, y, texture, frame, projectileTexture, type) //can handle most of these in a type switch!!
    {
        super(scene, x, y, texture, frame);
        //assign input values
        this.projectileTexture = projectileTexture;
        this.type = type;


        //handle enemy typing
        switch(type)
        {
            case 0:
                this.projSpeed = 8;
                this.health = 1;
                this.baseHealth = 1;
                this.scorePoints = 30;
                this.enemySpeed = 4000;
                this.repeat = 0;

                this.points = [
                    x, y,
                    scene.game.config.width - 20, scene.game.config.height/4,
                    20, scene.game.config.height/2,
                    scene.game.config.width - 20, scene.game.config.height/2 + scene.game.config.height/4,
                    x, scene.game.config.height + this.displayHeight
        
                ];
                break;

            case 1:
                this.projSpeed = 10;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 15;
                this.enemySpeed = 3000;
                this.repeat = -1;

                this.points = [
                    30, y,
                    scene.game.config.width - 30, y
        
                ];
                break;


            case 2:
                this.projSpeed = 7;
                this.health = 2;
                this.baseHealth = 2;
                this.scorePoints = 25;
                this.enemySpeed = 4500;
                this.repeat = 0;

                this.curvepoint;
                if (x <= this.scene.game.config.width)
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
                x, scene.game.config.height+this.displayHeight
                ];
                
                 break;


            case 3:
                this.projSpeed = 6;
                this.health = 3;
                this.baseHealth = 3;
                this.scorePoints = 10;
                this.enemySpeed = 5500;
                this.repeat = 0;

                this.points = [
                    x, y, 
                    x, this.displayHeight + scene.game.config.height
        
                ];
                break;
        }



        //set up for sprite and projectile array
        //
        this.my = {sprite: {}};
        this.my.sprite.projectile = [];  
        this.maxproj = 20;


        this.cooldown = 50;


        this.curve = new Phaser.Curves.Spline(this.points);
       
        this.my.sprite.enemy = scene.add.follower(this.curve, x, y, this.texture).setScale(1.5);
        this.active = true; //change later for group addition


        return this;
    }




    update()
    {
        let my = this.my;


        this.cooldown--;


        this.x = my.sprite.enemy.x;
        this.y = my.sprite.enemy.y;


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




        //make projectiles move
        for (let projectile of my.sprite.projectile) {
            projectile.y += this.projSpeed; //maybe make projectile speed variants??
        }


        //remove invalid projectiles
        my.sprite.projectile = my.sprite.projectile.filter((projectile) => {
            if (projectile.y >= this.scene.game.config.height + this.displayHeight/2)
                {
                    projectile.destroy(); //idk if this is doing anything.....
                }
            return projectile.y < this.scene.game.config.height + this.displayHeight/2;
        });

        //make inactive if outside of bounds

        if (this.y >= this.scene.game.config.height + this.displayHeight/2)
            {
                this.makeInactive();
                this.makeActive();
            }


    }


    makeActive()
    {
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
            yoyo: true,
           });


    }


    makeInactive()
    {
        this.my.sprite.enemy.stopFollow();
        this.my.sprite.enemy.visible = false;
        this.my.sprite.enemy.y = -100;
        this.active = false;


    }


}
