const gameState = {};

var stars
var bullets;
var lastFired = 0;
var fire;
var Evil;
var Life = 10;
var GBDelay = 150;

function preload(){
 this.load.image('Galax','Assets/Images/SideShip.png');
  this.load.image('UFO','Assets/Images/Ufo.png');
  this.load.image('Bad','Assets/Images/BadShip.png');
  this.load.image('Missile','Assets/Images/MissileR.png');
  this.load.image('bomb','Assets/Images/Mombomb.png')
}

function sortedEnemies(){
  const orderedByXCoord = gameState.Evil.getChildren().sort((a, b) => a.x - b.x);
  return orderedByXCoord;
}

function numOfTotalEnemies(){
  const totalEnemies = gameState.Evil.getChildren().length;
  return totalEnemies;
  
}

function create(){
    gameState.sprite = this.physics.add.image(400, 300, 'Galax').setScale(.13);

    gameState.sprite.setDamping(true);
    gameState.sprite.setDrag(.99);
    gameState.sprite.setMaxVelocity(400);
    gameState.sprite.setCollideWorldBounds(true);
    gameState.sprite.setBounce(true)

    cursors = this.input.keyboard.createCursorKeys();

    text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
  
  gameState.enemy =  
  this.physics.add.sprite(900,200,'Bad').setScale(.14)

  gameState.Evil = this.physics.add.group();
  
  for (let yVal = 1; yVal < 4; yVal++) {
    for (let xVal = 1; xVal < 4; xVal++) {
      gameState.Evil.create(50 * xVal, 50 * yVal, 'UFO').setScale(.13);
    }
  } 
  gameState.EvilVelocity = 2;

 gameState.bombs = this.physics.add.group();

  const genBombs = () => {
    let randomEvil = Phaser.Utils.Array.GetRandom(gameState.Evil.getChildren());
   
    gameState.bombs.create(randomEvil.x, randomEvil.y, 'bomb').setGravityY(100).setScale(.05);
  };

  gameState.bombsLoop = this.time.addEvent({
    delay: 300,
    callback: genBombs,
    callbackScope: this,
    loop: true
  });
  
  this.physics.add.collider(gameState.bombs, gameState.sprite, bomb => {
    gameState.bombsLoop.destroy();
    this.physics.pause();
    this.add.text(210, 250, 'Game Over \n Click to restart', { fontSize: '15px', fill: '#000' });
  });

    var Bullet = new Phaser.Class({

        Extends: Phaser.Physics.Arcade.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'Missile');
            
            //this.setBlendMode(1);
            this.setDepth(1);

            this.speed = 200;
            this.lifespan = 1000;
          this.setScale(0.09);

            this._temp = new Phaser.Math.Vector2();
        },

        fire: function (ship)
        {
            this.lifespan = 1000;

            this.setActive(true);
            this.setVisible(true);
            // this.setRotation(ship.rotation);
            this.setAngle(ship.body.rotation);
            this.setPosition(ship.y);
            this.body.reset(ship.x, ship.y);

          
                var angle = Phaser.Math.DegToRad(ship.body.rotation);
          
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

            this.body.velocity.x *= 2;
            this.body.velocity.y *= 2;
        },

        update: function (time, delta)
        {
            this.lifespan -= delta;

            if (this.lifespan <= -2000)
            {
                this.setActive(false);
                this.setVisible(false);
                this.body.stop();
            }
        }

    });   

    gameState.bullets = this.physics.add.group({
        classType: Bullet,
        maxSize: 30,
        runChildUpdate: true
    });
  
}
  

function update(time){
 
   if (cursors.up.isDown)
    {
        this.physics.velocityFromRotation(gameState.sprite.rotation, 200, gameState.sprite.body.acceleration);
    }
    else
    {
        gameState.sprite.setAcceleration(0);
    }

    if (cursors.left.isDown)
    {
        gameState.sprite.setAngularVelocity(-300);
    }
    else if (cursors.right.isDown)
    {
        gameState.sprite.setAngularVelocity(300);
    }
    else
    {
        gameState.sprite.setAngularVelocity(0);
    }
    if (cursors.down.isDown)
    {
        this.physics.velocityFromRotation(gameState.sprite.rotation, -200, gameState.sprite.body.acceleration);
    } 
    if (cursors.space.isDown && time > lastFired){
      var bullet = gameState.bullets.get();
        if (bullet)
        {
            bullet.fire(gameState.sprite);

            lastFired = time + 200;
        }
    }
  
 if (numOfTotalEnemies() === 0) {
      gameState.active = false;
      
      this.physics.pause();
 }
   gameState.Evil.getChildren().forEach(evil => {
        evil.x += gameState.EvilVelocity;
      });
    gameState.leftMostEvil = sortedEnemies()[0];
    gameState.rightMostEvil = sortedEnemies()[sortedEnemies().length - 1];
    if (gameState.leftMostEvil.x < 30 || gameState.rightMostEvil.x > 1320) {
      gameState.EvilVelocity *= -1;
      gameState.Evil.getChildren().forEach(Evil => {
        Evil.y += 1;
      });
 }

   gameState.bombs.getChildren().forEach(bomb => {
       if (bomb.y > 550) {
          bomb.destroy();
        }
      });
}

const config = {
   type: Phaser.AUTO,
    width: 1350,
    height: 550,
    backgroundColor: "b9eaff",
    physics: {
        default: 'arcade',
        arcade: {
            enableBody: true
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);
