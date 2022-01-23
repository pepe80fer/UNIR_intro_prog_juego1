class Enemy extends Phaser.Physics.Arcade.Sprite
{
    /**
     * 
     * @param {scene} scene La escena principal
     * @param {number} x Posición en X inicial
     * @param {number} y Posición en Y inical
     * @param {string} sprite Nombre del sprite cargado
     * @param {number} endLeft Borde izquierdo en la plataforma
     * @param {number} endRight Borde derecho en la plataforma
     * @param {number} velMax valor para calcular la velociad máxima de movimiento del enemigo
     * @param {number} velMin valor para calcular la velociad mímina de movimiento del enemigo
     */
    constructor(scene, x, y, sprite, endLeft, endRight, velMax, velMin)
    {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.velMax = velMax;
        this.velMin = velMin;
        this.endLeft = endLeft;
        this.endRight = endRight;
        this.setVelocityX(this.generarValorVelocidad());

        this.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNames('sprites_enemy', { start: 1, end: 6, prefix: 'walk-' }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNames('sprites_enemy', { start: 1, end: 5, prefix: 'attack-' }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(player)
    {
        this.cambiarDirección();
        this.play('walk', true);
    }

    /**
     * Generar un número aleatorio para la velocidad y no hacerlo predecible
     * @returns {number} número aleatorio entre valor mínimo y máximo
     */
     generarValorVelocidad() {
        var velocidad = Math.floor((Math.random() * (this.velMax - this.velMin) + this.velMin)) * 10;
        return velocidad;
    }

    /**
     * Validación de cuando el enemigo llega al borde de la plataforma para cambiar la dirección de movimiento
     * La velocidad de movimiento tambien cambia en la función generarValorVelocidad()
     */
    cambiarDirección() {
        if (this.x >= this.endRight) {
            this.setVelocityX(this.generarValorVelocidad() * -1);
            this.setFlipX(true); 
        } else if (this.x <= this.endLeft) {
            this.setVelocityX(this.generarValorVelocidad());
            this.setFlipX(false); 
        }
    }
}
