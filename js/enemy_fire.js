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

    update()
    {
        this.play('fireCol', true);
    }

    fireOff() {
        this.play('fireCol_off', true);
    }
}
