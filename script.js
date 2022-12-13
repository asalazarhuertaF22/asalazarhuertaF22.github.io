const gameState = {};

var Galax = gameState.sprite
var Badship
var stars
var bullets;
var lastFired = 0;
var fire;
var Evil;
var Life = 10;

function preload(){
 this.load.image('Galax','Assets/Images/SideShip.png');
  this.load.image('UFO','Assets/Images/Ufo.png');
  this.load.image('Badship','Assets/Images/Badd.png');
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
 // When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
  gameState.active = true;
this.input.on('pointerup', () => {
		if (gameState.active === false) {
			this.scene.restart();
		}
	})
  //this the sprite galax which is the charcater you play as which is a medium size redship and with its drag,max velocity,world collide bounds,and keyboard cursors input
    gameState.sprite = this.physics.add.image(400, 300, 'Galax').setScale(.13);

    gameState.sprite.setDamping(true);
    gameState.sprite.setDrag(.99);
    gameState.sprite.setMaxVelocity(400);
    gameState.sprite.setCollideWorldBounds(true);
    gameState.sprite.setBounce(true)

    cursors = this.input.keyboard.createCursorKeys();

    text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
  // this the black/pink ship that will follow you and can't die
  gameState.Bad = this.physics.add.image(200,100,'Badship').setScale(.14)
  
 

//this is the evil ufo which will movee left and right and this has the formation of the ufos
  gameState.Evil = this.physics.add.group();
  
  for (let yVal = 1; yVal < 4; yVal++) {
    for (let xVal = 1; xVal < 6; xVal++) {
      gameState.Evil.create(50 * xVal, 50 * yVal, 'UFO').setScale(.13);
    }
  } 
  //velocity of evil ufo
  gameState.EvilVelocity = 5;
//bombs 
 gameState.bombs = this.physics.add.group();
//this to generate the bombs and let random ufo(evil)drop a bomb
  const genBombs = () => {
    let randomEvil = Phaser.Utils.Array.GetRandom(gameState.Evil.getChildren());
    //this where the bombs drop randomly on the and evil ufo by the x and y coordinate
      gameState.bombs.create(randomEvil.x,randomEvil.y,'bomb').setGravityY(100).setScale(.05);
  };
//this the loop for the bombs and to generate the bombs and to delay the drop rate 
  gameState.bombsLoop = this.time.addEvent({
    delay: 1000,
    callback: genBombs,
    callbackScope: this,
    loop: true
  });
  //collider for the bombs from the ufo and once they hit the sprite(galax) the sprite is destroyed
  this.physics.add.collider(gameState.bombs, gameState.sprite, bomb => {
    gameState.bombsLoop.destroy();
    this.physics.pause();
    this.add.text(550, 250, 'Game Over \n Click to restart', { fontSize: '15px', fill: '#000' });
  });
  var Bullet = new Phaser.Class({

        Extends: Phaser.Physics.Arcade.Image,

        initialize:
//phaser class for speed and lifespan and size of bullet
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
//this is the function for shooting the bullets
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
//this is the size of the buulet group and class type
    gameState.bullets = this.physics.add.group({
        classType: Bullet,
        maxSize: 30,
        runChildUpdate: true
    });
//this is a collider to let you know that once the evil ufo is hit by the bullets the evil ufo is destroyed
    this.physics.add.collider(gameState.Evil, gameState.bullets, (evil, bullet) => {
    bullet.destroy();
    evil.destroy();
  });
 
}
  

function update(time){
 if (gameState.active){
   if (cursors.up.isDown)
     //this is the movement of the sprite and keys for the movement
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
   // this the if statement for the bullets so when you push spacebar it shoots a bullet
   if (cursors.space.isDown && time > lastFired){
      var bullet = gameState.bullets.get();
        if (bullet)
        {
            bullet.fire(gameState.sprite);

            lastFired = time + 200;
        }
    }
  //this is destroys the whole thing once you destroy all the ships and shows a you win text
 if (numOfTotalEnemies() === 0) {
      gameState.active = false;
    gameState.bombsLoop.destroy();
      this.physics.pause();
      this.add.text(250,250,'You Won!',{fontSize: '15px', fill: '#000000'});
     
 }
   //this makes the movement of the evil ufos move and sets the direction they are moving in
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
//this makes the bombs generate and get the bombs
   gameState.bombs.getChildren().forEach(bomb => {
       if (bomb.y > 550) {
          bomb.destroy();
        }
      });
 }
 //this makes the bad black/pink ship rotate and look towards the sprite(Galax)
  
  gameState.rotation = Phaser.Math.Angle.Between(gameState.Bad.x, gameState.Bad.y, gameState.sprite.x, gameState.sprite.y);
  gameState.Bad.setAngle(Phaser.Math.RadToDeg(gameState.rotation) - 45);
//this  makes the the Bad ship mobe towards you and try to destroy you
  this.physics.moveToObject(gameState.Bad, gameState.sprite, 50);
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
