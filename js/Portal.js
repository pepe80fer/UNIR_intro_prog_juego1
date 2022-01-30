class Portal extends Phaser.Physics.Arcade.Sprite
{
    /**
     * 
     * @param {scene} scene La escena principal
     * @param {number} x Posición en X inicial
     * @param {number} y Posición en Y inical
     * @param {string} sprite Nombre del sprite cargado
     */
    constructor(scene,x,y, sprite)
    {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

    }

}