var PLAY = 1;
var END = 0;
var gameState = PLAY;


// cccccccccccccccccccccccccc


let classifier;
// Model URL
let imageModelURL = 
"https://teachablemachine.withgoogle.com/models/IcGRKJXhe/"

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";


// ////////////////////////////////

function preload(){
  backgroundImg=loadImage("bg.jpg");
  groundImg=loadImage("gound.png");
  obstacleImg=loadImage("grassHalf.png");
playerAnimation=loadAnimation("trex1.png","trex3.png","trex4.png","trex1.png");
player_Collided=loadAnimation("trex_collided.png");
enemyImg=loadImage("obstacle1.png");
pointImg=loadImage("point.png")

// //////////////////////////

classifier = ml5.imageClassifier(imageModelURL + 'model.json');

/////////////////////////////
}


function setup() {
  createCanvas(700,300);
score=0;
////////////////////////

video = createCapture(VIDEO);
//video.postion(650,250)
  video.size(200,140);
  video.hide();

  flippedVideo = ml5.flipImage(video)
  // Start classifying
  classifyVideo();
///////////////////


  ground=createSprite(350, 200, 500, 50);
  ground.addImage(groundImg);
  ground.x=ground.width/2;

  invisibleGround=createSprite(350, 260, 5000, 10);
  invisibleGround.x=invisibleGround.width/2;
  invisibleGround.visible=false;

player=createSprite(50,250,20,20);
player.addAnimation("running",playerAnimation);
player.addAnimation("collided",player_Collided);
player.scale=0.4;

wall=createSprite(350, 2, 900, 5);
wall.visible=false;
wall1=createSprite(2, 2, 5, 900);
wall1.visible=false;
wall2=createSprite(698, 2, 5, 900);
wall2.visible=false;


obstaclesGroup = createGroup();
enemyGroup=createGroup();
pointGroup=createGroup();
}

function draw() {
  background("white");  

image(backgroundImg, 0,0, 5000, 350)
  fill("red")
  text("Score: "+ score, 500,50);

  text("Use Up,Left,Right Arrow To Move The Player",200,40)

  player.velocityX=0;
  player.velocityY=0;


  if (gameState===PLAY){
  ground.velocityX=-2

  if (ground.x < 350){
    ground.x = ground.width/2;
  }
ground.visible=false
  if (invisibleGround.x < 350){
    invisibleGround.x = invisibleGround.width/2;
  }


  // score = score + Math.round(frameCount/350);

  if(frameCount% 5 === 0){
score = score+1
  }
  spawnPoints();

  if(player.isTouching(pointGroup)){
    pointGroup[0].destroy()
    score=score+20
  }
  
  
  // if(keyDown(UP_ARROW)){
  //   player.velocityY=-12
  // }
  // if(keyDown(LEFT_ARROW)){
  //   player.velocityX=-12
  // }
  // if(keyDown(RIGHT_ARROW)){
  //   player.velocityX=+12
  // }

    
  if(label === "Up"){
    player.velocityY=-12
  }
  if(label == "Left"){
    player.velocityX=-12
 }
  if(label=="Right"){
       player.velocityX=+5
  }

  player.velocityY = player.velocityY+4.5;

  player.collide( invisibleGround)
  player.collide(obstaclesGroup)
  player.collide(wall)
  player.collide(wall1)
  player.collide(wall2)


  spawnObstacles();
spawnEnemy();


  if(player.isTouching(enemyGroup)){
   
    gameState=END;
  }
}
else if(gameState===END){
  player.changeAnimation("collided",player_Collided);

  ground.velocityX=0;
  player.velocityX=0;
  player.velocityY=0;

  obstaclesGroup.setLifetimeEach(-1);
  enemyGroup.setLifetimeEach(-1);
  pointGroup.setLifetimeEach(-1);

  obstaclesGroup.setVelocityXEach(0);
  enemyGroup.setVelocityXEach(0);
  pointGroup.setVelocityXEach(0);


  fill("red")
  textSize(25)
  text("Press 'R' Key To Restart",250,80);
}

if(keyDown("R")){
  reset();
}



  drawSprites();
  ////////////
image(flippedVideo, 500, 170);

// Draw the label
fill(255);
textSize(16);
textAlign(CENTER);
text(label, width / 2, height - 4);

/////////
}

function spawnObstacles(){
  if(frameCount%60===0){
    var obstacle=createSprite(700,200,80,20);
    obstacle.y=Math.round(random(120,200));
    obstacle.addImage(obstacleImg)
    obstacle.velocityX=-(4 + 3* score/1000);
 
    obstacle.scale=0.5

    obstaclesGroup.add(obstacle);

    var obstacle1=createSprite(obstacle.x+32,obstacle.y,80,20);
    // obstacle1.y=Math.round(random(80,200));
    obstacle1.addImage(obstacleImg)
    obstacle1.velocityX=-(4 + 3* score/1000);
 
    obstacle1.scale=0.5

    obstaclesGroup.add(obstacle1);
  }
}

function spawnEnemy(){
  if(frameCount%100===0){
    var enemy=createSprite(700,250,20,20);
    enemy.addImage(enemyImg);
    enemy.scale=0.3
    enemy.y=Math.round(random(80,250));
    enemy.velocityX=-3;
  enemy.debug=true
    enemyGroup.add(enemy);
    enemy.setCollider("circle", 0,0,10)
  }
}

function spawnPoints(){
  if(frameCount%200===0){
    var point=createSprite(700,250,15,15);
    point.addImage(pointImg);
    point.scale=0.3;
    point.y=Math.round(random(80,260));
    point.velocityX=-3;
    pointGroup.add(point);

    point.debug=true
    point.setCollider("circle",-15,-15,10);

  }
}

function reset(){
  gameState=PLAY


  obstaclesGroup.destroyEach();
  enemyGroup.destroyEach();
  score=0; 
  player.x=50;
  player.y=250;
  player.changeAnimation("running", playerAnimation);
}



// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
  // Classifiy again!
  classifyVideo();
}