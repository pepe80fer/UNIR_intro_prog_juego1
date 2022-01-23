class MainScene extends Phaser.Scene
{
    preload()
    {
        this.load.image('tiles','res/Tileset.png');
        this.load.tilemapTiledJSON('map','res/Map.json');
        this.load.image('bg-1', 'res/sky.png');
        this.load.image('sea', 'res/sea.png');
        this.load.image('player', 'res/idle-1.png');
        this.load.image('enemy', 'res/tronchungo.png');
        //Phaser.Physics.Arcade.Sprite
        // https://gammafp.com/tool/atlas-packer/
        this.load.atlas('sprites_jugador','res/player_anim/player_anim.png', 'res/player_anim/player_anim_atlas.json');
        this.load.atlas('sprites_enemy','res/tronchungo_anim/tronchungo.png', 'res/tronchungo_anim/tronchungo_atlas.json');
        this.load.spritesheet('tilesSprites','res/Tileset.png',
        { frameWidth: 32, frameHeight: 32 });
    }

    create()
    {

        var bg_1 = this.add.tileSprite(0, 0, windows.width*2, windows.height*2, 'bg-1');
        bg_1.fixedToCamera = true;
        //necesitamos un player
        this.player = new Player(this,50,100);
        var map = this.make.tilemap({ key: 'map' });
        var tiles = map.addTilesetImage('Plataformas', 'tiles');
        
        var layer2 = map.createLayer('Fondo', tiles, 0, 0);
        var layer = map.createLayer('Suelo', tiles, 0, 0);
        //enable collisions for every tile
        layer.setCollisionByExclusion(-1,true);
        this.physics.add.collider(this.player,layer);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels);

        
        this.objetos = map.getObjectLayer('objetos')['objects'];
        this.setas = [];
        for(var i = 0; i < this.objetos.length; ++i)
        {
            var obj = this.objetos[i];
            if(obj.gid == 115) // en mi caso la seta
            {
                var seta = new Seta(this,obj.x,obj.y);
                this.setas.push(seta);
                this.physics.add.overlap(seta, this.player, this.spriteHit,null,this);
            }
        }
        this.score = 1;
        this.scoreText = this.add.text(16, 16, 'PUNTOS: '+this.score, { 
            fontSize: '20px', 
            fill: '#000', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        
        

        // Colisión solo con la parte izquierda del mundo
        this.physics.world.setBoundsCollision(true, false, false, false);
        // El jugador colisiona contra los límites del mundo (parte izquierda definida)
        this.player.setCollideWorldBounds(true);

        this.enemy1 = this.crearEnemigo(this, layer, 240, 272, 20, 240, 15, 5);
        this.enemy2 = this.crearEnemigo(this, layer, 480, 208, 430, 500, 10, 4);
        this.enemy3 = this.crearEnemigo(this, layer, 680, 304, 690, 790, 10, 4);

    }

    spriteHit (sprite1, sprite2) {

        sprite1.destroy();
 
    }

    update (time, delta)
    {
        this.player.update(time,delta);

        this.enemy1.update(this.player);
        this.enemy2.update();
        this.enemy3.update();

        // Validar si el jugador sale del escenario por la parte infierior
        if (this.player.validarCaidaPlayer(config.height, this.player.y)) {
            // Mover el jugador a las coordenadas iniciales del juego
            this.player.y = 50;
            this.player.x = 50;
        }
    }

    /**
     * Crear los enemigos en la escena principal
     * @param {scene} scene Escena actual
     * @param {layer} layer Suelo
     * @param {number} x Posición en X
     * @param {number} y Posición en Y
     * @param {number} endLeft Borde izquierdo en la plataforma
     * @param {number} endRight Borde derecho en la plataforma
     * @param {number} vMax Valor para la velocidad máxima de movimiento
     * @param {number} vMin Valor para la velocidad mínima de movimiento
     * @returns Objeto de enemigo instanciado
     */
    crearEnemigo(scene, layer, x, y, endLeft, endRight, vMax, vMin) {
        // Crear el enemigo plataforma
        var enemy = new Enemy(scene, x, y, 'enemy', endLeft, endRight, vMax, vMin);
        // Colisión entre el enemigo y el escenario
        this.physics.add.collider(enemy, layer);
        return enemy;
    }
}