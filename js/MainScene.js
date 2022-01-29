class MainScene extends Phaser.Scene
{
    preload()
    {
        this.load.image('tiles','res/Tileset.png');
        this.load.tilemapTiledJSON('map','res/Map.json');
        this.load.image('bg-1', 'res/sky.png');
        this.load.image('sea', 'res/sea.png');
        this.load.image('player', 'res/idle-1.png');
        this.load.image('enemy', 'res/worm.png');
        //Phaser.Physics.Arcade.Sprite
        // https://gammafp.com/tool/atlas-packer/
        this.load.atlas('sprites_jugador','res/player_anim/player_anim.png', 'res/player_anim/player_anim_atlas.json');
        this.load.atlas('sprites_enemy','res/worm/worm_walk.png', 'res/worm/worm_walk_atlas.json');
        this.load.spritesheet('tilesSprites','res/Tileset.png',
        { frameWidth: 32, frameHeight: 32 });

        // GBW 20220128 Inicio
        this.load.audio('musicaFondo', 'res/assets/Background.mp3');
        // GBW Fin
          
    }

    create()
    {

        var bg_1 = this.add.tileSprite(0, 0, windows.width*25, windows.height*2, 'bg-1');
        bg_1.fixedToCamera = true;
        //necesitamos un player
        var map = this.make.tilemap({ key: 'map' });
        var tiles = map.addTilesetImage('Plataformas', 'tiles');
        
        
        var layer5 = map.createLayer('Detalles3', tiles, 0, 0);
        var layer4 = map.createLayer('Detalles2', tiles, 0, 0);
        var layer3 = map.createLayer('Detalles', tiles, 0, 0);
        var layer2 = map.createLayer('Fondo', tiles, 0, 0);
        var layer = map.createLayer('Suelo', tiles, 0, 0);
        this.player = new Player(this, 60, 60);

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
                //GBW Inicio
                this.physics.add.overlap(seta, this.player, function (seta, scoreText){
                    seta.destroy();
                    this.score = this.score + 1;
                //GBW Fin
                }, null, this);
            }
        }

        // Colisión solo con la parte izquierda del mundo
        this.physics.world.setBoundsCollision(true, false, false, false);
        // El jugador colisiona contra los límites del mundo (parte izquierda definida)
        this.player.setCollideWorldBounds(true);
        
        // Se crea un grupo de físicas para los enemigos
        this.groupEnemies = this.physics.add.group();
        // Crear los enemigos en el escenario
        this.createEnemies(layer);
        // Detectar si el jugador toca alguno de los enemigos para enviarlo al inicio del juego
        this.physics.add.overlap(this.groupEnemies, this.player, this.playerToStart, null, this);

        this.score = 0;

        //GBW Inicio

        this.scoreText = this.add.text(16, 16, 'SCORE: '+ this.score, { 
            fontSize: '20px', 
            fill: '#000', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        this.scoreText.setScrollFactor(0);

        let sonidoFondo = this.sound.add('musicaFondo');
        sonidoFondo.loop = true;
        sonidoFondo.play();

        // GBW Fin
    }

    zeroPad(number, size){
        var stringNumber = String(number);
        while(stringNumber.length < (size || 2)){
          stringNumber = '0' + stringNumber;
        }
        return stringNumber;
    }

    /*createSetas(layer) {
        
        Setas = this.physics.add.group({
            key:'seta',
            repeat: 10,
            setXY: { x:12, y:0, setpX:40 }
        });

        Setas.children.iterate((child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
        });
    }*/


    spriteHit (sprite1, sprite2) {
        sprite1.destroy();
    }

    update (time, delta)
    {
        this.player.update(time,delta);
        this.updateEnemies();

        //GBW Inicio
        this.scoreText.setText('SCORE: ' + this.score);
        //GBW Fin

        // Validar si el jugador sale del escenario por la parte infierior
        if (this.player.validarCaidaPlayer(config.height, this.player.y)) {
            // Mover el jugador a las coordenadas iniciales del juego
            this.playerToStart();
        }
    }

    coleccionarSeta(player, seta){
        seta.disableBody(true,true);

        this.score += 1;
        
    }

    /**
     * Mover el jugador a las coordenadas iniciales del juego
     */
    playerToStart() {
        this.player.y = 60;
        this.player.x = 60;

        /* ################################################### */
        /* Aqui se puede implementar el descuento de las vidas */
        /* ################################################### */
    }

    /**
     * Crear los enemigos por todo el escenario
     * @param {layer} layer Suelo
     */
    createEnemies(layer) {
        this.enemy1 = this.createEnemy(this, layer, 60, 361, 60, 240, 15, 5);
        this.enemy2 = this.createEnemy(this, layer, 850, 105, 860, 1100, 15, 5);
        this.enemy3 = this.createEnemy(this, layer, 1110, 361, 860, 1100, 15, 5);
        this.enemy4 = this.createEnemy(this, layer, 1280, 425, 1281, 1510, 15, 5);
        this.enemy5 = this.createEnemy(this, layer, 1600, 169, 1341, 1600, 15, 5);
        this.enemy6 = this.createEnemy(this, layer, 1920, 329, 1921, 2330, 15, 5);
        this.enemy7 = this.createEnemy(this, layer, 2335, 329, 1921, 2330, 15, 5);
        this.enemy8 = this.createEnemy(this, layer, 2335, 329, 1921, 2330, 18, 9);
        this.enemy9 = this.createEnemy(this, layer, 2875, 265, 2876, 2980, 10, 5);
        this.enemy10 = this.createEnemy(this, layer, 2875, 41, 2876, 2980, 10, 5);
        this.enemy11 = this.createEnemy(this, layer, 4035, 361, 3741, 4035, 15, 10);
        this.enemy12 = this.createEnemy(this, layer, 3740, 361, 3741, 4035, 15, 10);
        this.enemy13 = this.createEnemy(this, layer, 4780, 425, 4281, 4780, 15, 10);
        this.enemy14 = this.createEnemy(this, layer, 4280, 425, 4281, 4780, 15, 10);
        this.enemy15 = this.createEnemy(this, layer, 4280, 425, 4281, 4780, 10, 5);
        this.enemy16 = this.createEnemy(this, layer, 5470, 425, 5471, 5920, 20, 15);
        this.enemy17 = this.createEnemy(this, layer, 5470, 425, 5471, 5920, 20, 15);
        this.enemy18 = this.createEnemy(this, layer, 6300, 169, 6001, 6300, 18, 12);
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
    createEnemy(scene, layer, x, y, endLeft, endRight, vMax, vMin) {
        // Crear el enemigo plataforma
        var enemy = new Enemy(scene, x, y, 'enemy', endLeft, endRight, vMax, vMin);
        // Colisión entre el enemigo y el escenario
        this.physics.add.collider(enemy, layer);
        // Adicionar todos los enemigos al grupo de físicas
        this.groupEnemies.add(enemy);
        return enemy;
    }

    /**
     * Llamar la función update de cada enemigo creado
     */
    updateEnemies() {
        this.enemy1.update();
        this.enemy2.update();
        this.enemy3.update();
        this.enemy4.update();
        this.enemy5.update();
        this.enemy6.update();
        this.enemy7.update();
        this.enemy8.update();
        this.enemy9.update();
        this.enemy10.update();
        this.enemy11.update();
        this.enemy12.update();
        this.enemy13.update();
        this.enemy14.update();
        this.enemy15.update();
        this.enemy16.update();
        this.enemy17.update();
        this.enemy18.update();
    }
}