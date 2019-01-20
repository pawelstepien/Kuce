
var game = new Phaser.Game(1330, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update, backgroundColor: '#ff0000', });

function preload() {

    game.load.spritesheet('bimkeyGuy', 'assets/bimkeyGuy.png', 200, 140);
    game.load.image('grassLeft', 'assets/Tiles/grassLeft.png');
    game.load.image('grassMid', 'assets/Tiles/grassMid.png');
    game.load.image('grassRight', 'assets/Tiles/grassRight.png');
    game.load.image('boxCoinAlt', 'assets/Tiles/boxCoinAlt.png');
    game.load.image('blue', 'assets/Particles/blue.png');
    game.load.image('red', 'assets/Particles/red_small.png');
    game.load.image('green', 'assets/Particles/green.png');
    game.load.image('background', 'assets/bg.png');
    game.load.image('cloud', 'assets/cloud.png');

}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var bullets;
var fireButton;
var playerRotation = 'right';
var clouds;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.world.setBounds(0, 0, 1920, game.world.height);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    var background = game.add.sprite(0, 0, 'background');
    background.scale.setTo(10, 3);

    clouds = game.add.group();
    clouds.physicsBodyType = Phaser.Physics.ARCADE;
    clouds.setAll('outOfBoundsKill', true);
    clouds.setAll('checkWorldBounds', true);

    const createCloud = (x, y, speed) => {
        let cloud = clouds.create(x,  y, 'cloud');
        console.log(cloud)
    };
    createCloud(0,0, -100)
    createCloud(500,-200, -150)
    createCloud(1000,200, -125)
    
    bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(300, 'red');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    const createPlatform = (x, y, length) => {
        const tileSide = 70;
        let ground;

        ground = platforms.create(tileSide * x,  tileSide * y, 'grassLeft');
        ground.body.immovable = true;

        for(let i = 1; i < length - 1; i++) {
            ground = platforms.create(tileSide * x + (tileSide * i),  tileSide * y, 'grassMid');
            ground.body.immovable = true;
        }

        ground = platforms.create(tileSide * x + (tileSide * (length - 1)),  tileSide * y, 'grassRight');
        ground.body.immovable = true;
    };


   

    createPlatform(0, 9, 6);
    createPlatform(3, 7, 3);
    createPlatform(7, 5, 5);
    createPlatform(13, 6, 9);
    
    // The player and its settings
    player = game.add.sprite(32, game.world.height - 250, 'bimkeyGuy');
    player.scale.setTo(0.5, 0.5);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 2, 4], 10, true);
    player.animations.add('right', [1, 3, 5], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;
    // stars.scale.setTo(0.5, 0.5);


    game.camera.follow(player);
    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 36; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 140, 0, 'boxCoinAlt');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
        star.scale.setTo(0.5, 0.5);
    }
    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}


var lastFiredBulletTime = 0;
function fireBullet() {
    if (lastFiredBulletTime - game.time.now > -2) return;

    lastFiredBulletTime = game.time.now;

    bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x + (playerRotation === 'left' ? 0 : 100), player.y + 65);
            bullet.body.velocity.x = playerRotation === 'left' ? -600 : 600;
        }
}
function destroyBullet(bullet) {
    console.log('colision')
    bullet.kill();
}
function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.overlap(bullets, platforms, destroyBullet);
    // game.physics.arcade.collide(bullets, platforms);
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
        playerRotation = 'left';
        player.animations.play('left');
        if (!player.body.touching.down) {
            player.frame = 0;
        }
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
        playerRotation = 'right';
        player.animations.play('right');
        if (!player.body.touching.down) {
            player.frame = 1;
        } 
    }
    else
    {
        //  Stand still
        player.animations.stop();
    }
    if (fireButton.isDown) {
        fireBullet();
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -300;
    }

}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
