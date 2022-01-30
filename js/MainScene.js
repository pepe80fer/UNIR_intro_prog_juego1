class MainScene extends Phaser.Scene
{

    constructor(){
        super('mainscene')
    }

    preload()
    {
        this.load.image('tiles','res/Tileset.png');
        this.load.tilemapTiledJSON('map','res/Map.json');
        this.load.image('bg-1', 'res/fondo_cielo.png');
        this.load.image('player', 'res/idle-1.png');
        this.load.image('enemy', 'res/worm.png');
        this.load.image('fall', 'res/assets/fall.png');
        //Phaser.Physics.Arcade.Sprite
        // https://gammafp.com/tool/atlas-packer/
        this.load.atlas('sprites_jugador','res/player_anim/player_anim.png', 'res/player_anim/player_anim_atlas.json');
        this.load.atlas('sprites_enemy','res/worm/worm_walk.png', 'res/worm/worm_walk_atlas.json');
        this.load.spritesheet('tilesSprites','res/Tileset.png',
        { frameWidth: 32, frameHeight: 32 });

        // GBW 20220128 Inicio
        this.load.audio('musicaFondo', 'res/assets/Background.mp3');
        this.load.image('portal', 'res/assets/portal.png');
        this.load.image('victory', 'res/assets/Victory.png');
        //Carga delo sonido de salto a la escena
        this.load.audio('sonidoSalto', 'res/assets/Jump.mp3');
        // GBW Fin

        this.load.image('livesPic', 'res/heart.png');

          
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


        // Colisión solo con la parte izquierda del mundo
        this.physics.world.setBoundsCollision(true, false, false, true);
        // El jugador colisiona contra los límites del mundo (parte izquierda definida)
        this.player.setCollideWorldBounds(true);

        this.fall = this.physics.add.sprite(0, 479, 'fall');
        this.fall.setCollideWorldBounds(true);

        this.physics.add.overlap(this.fall, this.player, () => this.GameOver(), null, this);
        
        // Se crea un grupo de físicas para los enemigos
        this.groupEnemies = this.physics.add.group();
        // Crear los enemigos en el escenario
        this.createEnemies(layer);
        // Detectar si el jugador toca alguno de los enemigos para enviarlo al inicio del juego
        var colisionEnemigo = this.physics.add.overlap(this.groupEnemies, this.player,  function (){
            //GBW   Se incluyó la verificación de fin de juego para mostrar Game Over
            this.verificarContinuaJuego();
        }, null, this);

        this.vidasJugador = 1;
        this.invulnerabilidadJugador = false;
        this.isVisible = true;
        this.visibilityCounter = 0;
        this.score = 0;

        //GBW Inicio
        this.objetos = map.getObjectLayer('objetos')['objects'];
        this.setas = [];
        for(var i = 0; i < this.objetos.length; ++i)
        {
            var obj = this.objetos[i];
            if(obj.gid == 115)
            {
                var seta = new Seta(this,obj.x,obj.y);
                this.setas.push(seta);
                //GBW   Se incluyo función para destruir las setas y aumentar el contador de Score
                this.physics.add.overlap(seta, this.player, function (seta){
                    seta.destroy();
                    this.score = this.score + 1;
                    this.anadirVida();
                }, null, this);
            }
        } 

        //Creación de imágenes de vidas
        this.vida1 = this.add.image(750,30,'livesPic');
        this.vida1.setScale(0.1);
        this.vida1.setScrollFactor(0);
        this.vida2 = this.add.image(720,30,'livesPic');
        this.vida2.setScale(0.1);
        this.vida2.setScrollFactor(0);
        this.vida3 = this.add.image(690,30,'livesPic');
        this.vida3.setScale(0.1);
        this.vida3.setScrollFactor(0);

        //Creación del texto de Score
        this.scoreText = this.add.text(16, 16, 'SCORE: '+ this.score, { 
            fontSize: '20px', 
            fill: '#000', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        //Establecer unbicaciónm fija de línea de texto de Score.
        this.scoreText.setScrollFactor(0);
    
        //Creación del texto de Game Over
        this.gameOverText = this.add.text(400, 250, 'GAME OVER', { 
            fontSize: '70px', 
            fill: '#fff', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setShadow(-5, 5, '#000', 0);
        this.gameOverText.visible = false;
        this.gameOverText.setScrollFactor(0);

        //Creación del texto para reiniciar el juego
        this.clickToPlayAgainText = this.add.text(400, 450, 'Click To Play Again', { 
            fontSize: '20px', 
            fill: '#fff', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        this.clickToPlayAgainText.setOrigin(0.5);
        this.clickToPlayAgainText.setShadow(-3, 3, '#000', 0);
        this.clickToPlayAgainText.visible = false;
        this.clickToPlayAgainText.setScrollFactor(0); 

        //Inclusión de sonido de fondo 'Background.mp3'.
        this.sonidoFondo = this.sound.add('musicaFondo');
        this.sonidoFondo.loop = true;
        this.sonidoFondo.play();

        //Creación del portal final para finalizar el juego
        this.portal = this.createPortal(this, layer, 6350, 169);
        this.physics.add.overlap(this.portal, this.player,  function (){
            this.FinalizarJuego();
        }, null, this);

        //Imagen de finalización del juego
        this.victory = this.add.image(400, 200, 'victory');
        this.victory.visible = false;
        this.victory.setScrollFactor(0);

        //Creación del texto para mostrar Score final del juego
        this.scoreFinalText = this.add.text(400, 400, 'SCORE: '+ this.score, { 
            fontSize: '30px', 
            fill: '#fff', 
            fontFamily: 'verdana, arial, sans-serif' 
          });
        this.scoreFinalText.setOrigin(0.5);
        this.scoreFinalText.setShadow(-3, 3, '#000', 0);
        this.scoreFinalText.visible = false;
        this.scoreFinalText.setScrollFactor(0);

        //Inclusión de captura de evento cuando se presiona la tecla ESPACIO
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        //Agregando de sonido de salto a la escena
        this.sonidoSalto = this.sound.add('sonidoSalto');
        

        // GBW Fin
    }

    //GBW Inicio
    //Método para crear el portal final
    createPortal(scene, layer, x, y) {
        var portal = new Portal(scene, x, y, 'portal');
        this.physics.add.collider(portal, layer);
        return portal;
    }

    //Método para finalizar el juego cuando se llega al portal
    FinalizarJuego() {

        this.victory.visible = true;
        this.scoreFinalText.visible = true;
        this.clickToPlayAgainText.visible = true;
        this.physics.pause();
        this.input.on('pointerdown', ()=> this.scene.start('mainscene'));
        this.sonidoFondo.stop();
    }

    //Método para mostrar Game Over cuando se toca un enemigo o se cae teniendo cero vidas
    GameOver() {

        this.gameOverText.visible = true;
        this.clickToPlayAgainText.visible = true;
        this.physics.pause();
        this.input.on('pointerdown', ()=> this.scene.start('mainscene'));
        this.sonidoFondo.stop();
    }

    //Método para verificar si se reinicia el juego o es Game Over dependiendo de la cantidad de vidas restantes
    verificarContinuaJuego(){
        if(!this.invulnerabilidadJugador){

            if(this.vidasJugador > 0 && !this.invulnerabilidadJugador)
            {
                this.invulnerabilidadJugador = true;
                //this.playerToStart();
                this.vidasJugador--;

                this.validarVidas();
                this.visibilityCounter = 0;
                this.efectoInvulnerabilidad();
            }
            else
                this.GameOver();
        }
        
    }
    
validarVidas(){
    if(this.vidasJugador==3){
        this.vida1.visible = true;
        this.vida2.visible = true;
        this.vida3.visible = true;
    }else if(this.vidasJugador==2){
        this.vida1.visible = false;
        this.vida2.visible = true;
        this.vida3.visible = true;
    }else if(this.vidasJugador==1){
        this.vida1.visible = false;
        this.vida2.visible = false;
        this.vida3.visible = true;
    }else if(this.vidasJugador==0){
        this.vida1.visible = false;
        this.vida2.visible = false;
        this.vida3.visible = false;
    }
}

anadirVida(){
    if(this.vidasJugador<3){

    }
    this.vidasJugador++;
    this.validarVidas();

}


    efectoInvulnerabilidad(){
        this.invulnerabilidadJugador = true;

        if(!this.visible){
            this.player.alpha = 1;
            this.visible = true;
        }else{
            this.player.alpha = 0.1;
            this.visible = false;
        }
        this.visibilityCounter++;
        if(this.visibilityCounter >= 10){
            this.player.alpha = 1;
            this.invulnerabilidadJugador = false;
        }else{
            setTimeout(() => {
                this.efectoInvulnerabilidad();
            }, 100);
        }
    }

    // GBW Fin

    spriteHit (sprite1, sprite2) {
        sprite1.destroy();
    }

    update (time, delta)
    {
        this.validarVidas();

        this.player.update(time,delta);
        this.updateEnemies();

        //GBW   Se actualizar el score cada vez que coge una seta
        this.scoreText.setText('SCORE: ' + this.score);
        this.scoreFinalText.setText('SCORE: ' + this.score);

        //Lógica para que suene el sonido de salto cuando se presiona ESPACIO
        if (Phaser.Input.Keyboard.JustDown(this.spacebar))
        {
            if(this.player.body.onFloor()){
                this.sonidoSalto.play();
            }
        }
        //GBW

        // El sprite fall se mueve siempre a la posición X del player, para capturar si cae al agua.
        this.fall.x = this.player.x;
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