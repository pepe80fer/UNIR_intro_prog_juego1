class PinkFire extends Phaser.Physics.Arcade.Sprite
{
    /**
     * 
     * @param {scene} scene La escena principal
     * @param {number} x Posición en X inicial
     * @param {number} y Posición en Y inical
     * @param {string} sprite Nombre del sprite cargado
     * @param {boolean} flipX dirección del personaje
     */
    constructor(scene, x, y, sprite, flipX)
    {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.allowGravity = false;
        this.shootPower = this.scene.sound.add('shootPower');
        this.setActive(false);
        this.setVisible(false);
        this.flipX = flipX;
        

        this.anims.create({
            key: 'fire',
            frames: this.scene.anims.generateFrameNames('sprites_pinkfire', { start: 1, end: 6, prefix: 'fire-' }),
            frameRate: 16,
            repeat: -1
        });
    }

    update()
    {
        this.play('fire', true);
    }

    setPower(x, y, flipX) {
            this.body.allowGravity = false;
            this.flipX = flipX;
            this.setFlipX(this.flipX);
            this.setFlipX(this.flipX);
            if (this.flipX) {
                this.setVelocityX(-300);
            } else {
                this.setVelocityX(300);
            }
            this.setPosition(x + 10, y + 10);
            this.setActive(true);
            this.setVisible(true);
            this.shootPower.play();
    }

    removePower() {
        this.setActive(false);
        this.setVisible(false);
    }
}
