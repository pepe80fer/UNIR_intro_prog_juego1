class Player extends Phaser.Physics.Arcade.Sprite
{
    flipX = false;

    constructor(scene,x,y)
    {
        super(scene,x,y,'player');
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(22, 52);
        this.body.offset.y = 15;
        //continuación
        this.cursor = this.scene.input.keyboard.createCursorKeys();

        this.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNames('sprites_jugador', { start: 1, end: 18, prefix: 'walk-' }),
            frameRate: 32,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNames('sprites_jugador', { start: 1, end: 4, prefix: 'idle-' }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.scene.anims.generateFrameNames('sprites_jugador', { start: 1, end: 4, prefix: 'jump-' }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'fire',
            frames: this.scene.anims.generateFrameNames('sprites_pinkfire', { start: 1, end: 4, prefix: 'fire-' }),
            frameRate: 8,
            repeat: -1
        });
    }

    update(time,delta)
    {
        if(this.cursor.left.isDown)
        {
            this.setVelocityX(-200);
            this.flipX = true;
            this.setFlipX(this.flipX); 
        }
        else if(this.cursor.right.isDown)
        {
            this.setVelocityX(200);
            this.flipX = false;
            this.setFlipX(this.flipX);
        }
        else
        {
            //Parado
            this.setVelocityX(0);
        }

        if (this.cursor.space.isDown && this.body.onFloor()) {
            
            this.setVelocityY(-300);
        }


        if(!this.body.onFloor())
            this.play('jump', true);
        else if(this.body.velocity.x != 0)
            this.play('walk', true);
        else
            this.play('idle', true);
    }

    /**
     * Validar si el jugador sale del escenario por la parte infierior
     * @param {number} height alto del escenario
     * @param {number} y posición actual del jugador en el eje Y
     * @returns {boolean} verdadero si la posición del jugador supera el alto del escenario
     */
    validarCaidaPlayer(height, y) {
        return (y >= height + 50);
    }

    getFlipX() {
        return this.flipX;
    }
}