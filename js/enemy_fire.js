class EnemyFire extends Phaser.Physics.Arcade.Sprite
{
    /**
     * 
     * @param {scene} scene La escena principal
     * @param {number} x Posición en X inicial
     * @param {number} y Posición en Y inical
     * @param {string} sprite Nombre del sprite cargado
     */
    constructor(scene, x, y, sprite)
    {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.allowGravity = false;
        this.speed = Phaser.Math.GetSpeed(1, 1);
        this.fireBallSound = this.scene.sound.add('fireBallSound');


        this.anims.create({
            key: 'fireCol',
            frames: this.scene.anims.generateFrameNames('sprites_fire_col', { start: 4, end: 9, prefix: 'fire_col_' }),
            frameRate: 16,
            repeat: -1
        });

        this.anims.create({
            key: 'fireCol_off',
            frames: this.scene.anims.generateFrameNames('sprites_fire_col', { start: 10, end: 14, prefix: 'fire_col_' }),
            frameRate: 16,
            repeat: -1
        });
    }

    update(time, delta)
    {
        if (this.active) {
            this.y += (this.speed * delta);
            if (this.y > windows.height)
            {
                setTimeout(() => {
                    this.fireOn(this.x, -50);
                }, 300);
            }
        }
    }

    fireOn(x, y, flipX) {
        const num = (Math.floor(Math.random() * 2) + 1);
        const direction = flipX ? -90 : 90;
        this.setPosition(x + direction * num, y);
        this.play('fireCol', true);
        this.setActive(true);
        this.setVisible(true);
        this.fireBallSound.play();
    }

    fireOff() {
        this.body.immovable = true;
        this.fireBallSound.stop();
        this.play('fireCol_off', true);
        setTimeout(() => {
            this.setActive(false);
            this.setVisible(false);
        }, 300);
    }

    positionInit(posX) {
        this.fireOff();
        setTimeout(() => {
            this.x = posX + 80 * (Math.floor(Math.random() * 2) + 1);
            this.y = 100;
            this.fireOn();
        }, 300);
    }
}
