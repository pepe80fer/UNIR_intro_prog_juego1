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
        this.load.atlas('sprites_pinkfire','res/pinkfire/pinkfire.png', 'res/pinkfire/pinkfire_atlas.json');
        this.load.atlas('sprites_fire_col','res/fire_col/fire_col.png', 'res/fire_col/fire_col_atlas.json');
        this.load.spritesheet('tilesSprites','res/Tileset.png',
        { frameWidth: 32, frameHeight: 32 });

        // GBW 20220128 Inicio
        this.load.audio('musicaFondo', 'res/assets/Background.mp3');
        this.load.image('portal', 'res/assets/portal.png');
        this.load.image('victory', 'res/assets/Victory.png');
        //Carga del sonido de salto a la escena
        this.load.audio('sonidoSalto', 'res/assets/Jump.mp3');
        //Carga del sonido de golpe o dano a la escena
        this.load.audio('sonidocolisionEnemigo', 'res/assets/golpe.mp3');
        //Carga del sonido de agarrar setas a la escena
        this.load.audio('sonidoseta', 'res/assets/agarrarsetas.mp3');
        //Carga del sonido de game over a la escena
        this.load.audio('sonidogameOver', 'res/assets/gameover.mp3');
        //Carga del sonido de victoria a la escena
        this.load.audio('sonidovictory', 'res/assets/ganar.mp3');
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
        this.layer = map.createLayer('Suelo', tiles, 0, 0);
        this.player = new Player(this, 60,  60);

        //enable collisions for every tile
        this.layer.setCollisionByExclusion(-1,true);
        this.physics.add.collider(this.player, this.layer);
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
        this.createEnemies(map.getObjectLayer('enemigos')['objects']);
         //Agregando del sonido de golpe o dano a la escena
        this.sonidocolisionEnemigo = this.sound.add('sonidocolisionEnemigo');
         //Agregando del sonido de agarrar setas a la escena
        this.sonidoseta = this.sound.add('sonidoseta');
        //Agregando del sonido de game over a la escena
        this.sonidogameOver = this.sound.add('sonidogameOver');
        //Agregando del sonido de victoria a la escena
        this.sonidovictory = this.sound.add('sonidovictory');
        // Detectar si el jugador toca alguno de los enemigos para enviarlo al inicio del juego
        var colisionEnemigo = this.physics.add.overlap(this.groupEnemies, this.player, function () {
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
                    this.sonidoseta.play();
                    this.score = this.score + 1;
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

        // this.vidaNivel1 = this.add.sprite(370,140,'livesPic');
        this.vidaNivel1 = this.createExtraLife(this, this.layer, 370, 140);
        this.vidaNivel1.setScale(0.1);
        this.physics.add.overlap(this.vidaNivel1, this.player,  function (){
            this.anadirVida();
            this.vidaNivel1.destroy();
        }, null, this);
        this.vidaNivel1.body.setAllowGravity(false)

        this.vidaNivel2 = this.createExtraLife(this, this.layer, 3670, 250);
        this.vidaNivel2.setScale(0.1);
        this.physics.add.overlap(this.vidaNivel2, this.player,  function (){
            this.anadirVida();
            this.vidaNivel2.destroy();
        }, null, this);
        this.vidaNivel2.body.setAllowGravity(false)

        this.vidaNivel3 = this.createExtraLife(this, this.layer, 4540, 433);
        this.vidaNivel3.setScale(0.1);
        this.physics.add.overlap(this.vidaNivel3, this.player,  function (){
            this.anadirVida();
            this.vidaNivel3.destroy();
        }, null, this);
        this.vidaNivel3.body.setAllowGravity(false)

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
        this.portal = this.createPortal(this, this.layer, 6350, 169);
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

        // El player lanza poder de fuego
        this.setFirePlayer();

        // Bolas de fuego
        this.setFireBall();
    }
    createExtraLife(scene, layer, x, y) {
        var extraLife = new Portal(scene, x, y, 'livesPic');
        this.physics.add.collider(extraLife, layer);
        return extraLife;
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
        this.sonidovictory.play();
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
        this.input.on('pointerdown', () => this.scene.start('mainscene'));
        this.sonidogameOver.play();
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
                this.sonidocolisionEnemigo.play();
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
        this.vidasJugador++;
        this.validarVidas();
    
    }
    this.sonidoseta.play();
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
        
        // Llamar la función update de cada enemigo creado
        for (let enemy of this.enemies)
            enemy.update();

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
    }

    /**
     * Crear los enemigos por todo el escenario
     * @param {layer} layer Suelo
     */
    createEnemies(enemigos) {
        this.enemies = [];
        for(var i = 0; i < enemigos.length; ++i)
        {
            var obj = enemigos[i];
            let enemy = this.createEnemy(this, this.layer, 
                obj.x, 
                obj.y, 
                obj.properties[0].value, 
                obj.properties[1].value, 
                obj.properties[2].value, 
                obj.properties[3].value);
            this.enemies.push(enemy);
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
     * Detectar cuando la tecla F es pulsada
     * Crear un nuevo sprite de fuego y añadirla a la scena en la poisión en la que se encuentra el player
     * Destruir fuego y enemigo cuando estos colisionan
     * Destruir fuego si este toca el layer
     */
    setFirePlayer() {
        this.input.keyboard.on('keydown-F', () => {
            const f = new PinkFire(this, this.player.x + 10, this.player.y + 10, 'pinkfire', this.player.getFlipX());
            this.physics.add.overlap(f, this.groupEnemies, function (fire, enemy) {
                f.destroy();
                enemy.disableBody(true, true);
            });
            this.physics.add.collider(f, this.layer, () => {
                f.destroy();
            });
            f.update();
        });
    }

    setFireBall() {
        const num = Math.floor(Math.random() * 2) + 1;
        let ball = new EnemyFire(this, this.player.x + 80 * num, -50, 'fire_col');
        ball.setSize(25, 50, false);
        this.physics.add.collider(ball, this.layer, () => {
            ball.fireOff();
            setTimeout(() => {
                ball.destroy();
            }, 300);
        });
        this.physics.add.collider(ball, this.player, () => {
            ball.fireOff();
            this.GameOver();
            setTimeout(() => {
                ball.destroy();
            }, 300);
        });
        if (ball)
            ball.update();
        this.time.delayedCall(1000 * num, this.setFireBall, [], this);
    }

}