class Enemy extends Phaser.GameObjects.Sprite 
{
    constructor(scene, x, y, texture, frame, projectileTexture, enemyHealth, enemySpeed, scorePoints)
    {
        super(scene, x, y, texture, frame);
        this.projectileTexture = projectileTexture;
        this.enemySpeed = enemySpeed;
        this.enemyHealth = enemyHealth;
        this.scorePoints = scorePoints;

        this.my = {sprite: {}};
        this.my.sprite.projectile = [];   
        this.maxproj = 20;

        this.cooldown = 50;

        scene.add.existing(this);

        return this;
    }

    update()
    {
        let my = this.my;
        //for each enemy that has been created

        this.cooldown--;

        //make enemy shoot!
        if (this.cooldown <= 0)
            {
                if (my.sprite.projectile.length < this.maxproj) {
                    my.sprite.projectile.push(this.scene.add.sprite(
                        this.x, this.y-(this.displayHeight/2), this.projectileTexture).setScale(1.5)
                    );

                    this.scene.sound.play("enemyShoot", {
                        volume: 0.25
                    });
                    this.cooldown = 50;
                }
            }
        //move enemy downward, update once i figure out paths
        this.y += this.enemySpeed;


        //make projectiles move 
        for (let projectile of my.sprite.projectile) {
            projectile.y += 8; //maybe make projectile speed variants??
        }

        //remove invalid projectiles
        my.sprite.projectile = my.sprite.projectile.filter((projectile) => {
            if (projectile.y >= this.scene.game.config.height + this.displayHeight/2)
                {
                    projectile.destroy(); //idk if this is doing anything.....
                }
            return projectile.y < this.scene.game.config.height + this.displayHeight/2;
        });

        //disable enemy if outside bounds of game (later, for now this is a reset)
        if (this.y >= this.scene.game.config.height + this.displayHeight/2)
            {
                this.x = Math.random() * config.width;
                this.y = 10;
            }

    }

}
