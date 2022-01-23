

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Constants
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const TEXTURE_REPEATING = true;

const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 1220;

const STAGE_HEIGHT = 4000;
const STAGE_WIDTH = 12200;

const GRAVITY = 2;
const FRICTION = 0.9;

const FLOOR_LEVEL = 385;

const canvas = document.querySelector('canvas');
const context = document.querySelector("canvas").getContext("2d");

context.canvas.height = FRAME_HEIGHT;
context.canvas.width = FRAME_WIDTH;

let OFFSET = {x:0,y:0};

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Functions
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function displayText(text){
  context.fillStyle = "red";
  context.font = "15px Arial";
  context.fillText(text, 10, 30);
}

function drawFrame(){
  context.fillStyle = "#201A23";
  context.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
}

function drawFloor(){
  context.strokeStyle = "#2E2532";
  context.lineWidth = 30;
  context.beginPath();
  context.moveTo(0, FLOOR_LEVEL);
  context.lineTo(1220, FLOOR_LEVEL);
  context.stroke();
}

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///                                   Textures
//////////////////////////////////////|////////////////////////////////////////////////

const textures = {};
function addNewTexture(name,filename){
  textures[name] = new Image();
  textures[name].src = filename;
  textures[name].addEventListener('load',()=>{
    textures[`${name}Repeat`] = context.createPattern(textures[name],'repeat');
  });
}
addNewTexture('bricks','bricks.jpg');
addNewTexture('clouds','clouds.jpg');

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Controller
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///-------------------------------------------------------------------------------------------------Controller

const controller = {
    left: false,
    right: false,
    up: false,
    run: false,
    keyListener: function (event) {
      var key_state = (event.type == "keydown") ? true : false;
      switch (event.keyCode) {
        case keyCodes.arrowLeft:// left key
          controller.left = key_state;
          break;
        case keyCodes.space:// up key
          controller.up = key_state;
          break;
        case keyCodes.arrowRight:// right key
          controller.right = key_state;
          break;
        case keyCodes.shift:
          controller.run = key_state;
          break;
      }
    }
};

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Classes
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///-------------------------------------------------------------------------------------------------Point
class Point{
    constructor(x=0,y=0){
        this.x = x;
        this.y = y;
    }
};
///-------------------------------------------------------------------------------------------------Rectangle
class Rectangle{
    constructor(x=0,y=0,w=0,h=0){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    get p1(){
        return new Point(this.x,this.y);
    }
    get p2(){
        return new Point(this.x+this.w,this.y+this.h);
    }
    overlaps(rectangle){
        return  !(  this.p2.x <= rectangle.p1.x || 
                    this.p2.y <= rectangle.p1.y ||
                    this.p1.x >= rectangle.p2.x || 
                    this.p1.y >= rectangle.p2.y );
    }

};
///-------------------------------------------------------------------------------------------------Sprite
class Sprite extends Rectangle{
  constructor(x=0,y=0,w=32,h=32){
    super(x,y,w,h);
    this.color = colors.grey;
    this.texture = textures.bricks;
    // this.draw();
  }
  setRect(rectangle){
    this.x = rectangle.x;
    this.y = rectangle.y;
    this.w = rectangle.w;
    this.h = rectangle.h;
  }
  setXY(x,y){
    this.x = x;
    this.y = y;
  }
  applyColor(){
    context.fillStyle = this.color;
    context.beginPath();
    context.rect(this.x - OFFSET.x, this.y - OFFSET.y, this.w, this.h);
    context.fill();
  }
  applyTexture(repeating = false){
    if(repeating){
      const w = this.texture.width;
      const h = this.texture.height;
      for(let x = 0; x < this.w; x += w){
        for(let y = 0; y < this.h; y += h){
          context.drawImage(this.texture,
            0,                    //source start x
            0,                    //source start y
            this.w,               //source width
            this.h,               //source height
            this.x-OFFSET.x + x,  //destination x
            this.y-OFFSET.y + y,  //destination y
            this.w,               //destination width
            this.h);              //destination height
        }
      }
    } else {
      context.drawImage(this.texture,
                        0,
                        0,
                        this.w,
                        this.h,
                        this.x-OFFSET.x,
                        this.y-OFFSET.y,
                        this.w,
                        this.h);

    }

  }
  applyTextureRepeating(){
    context.fillStyle = this.texture;
    context.fillRect(this.x - OFFSET.x, this.y - OFFSET.y, this.w, this.h); 
  }
  applyTextureRepeating2(){
    const tW = this.texture.width;
    const tH = this.texture.height;

    for(let xCount = 0; xCount < this.width; xCount += tW){
      for(let yCount = 0; yCount < this.height; yCount += tH){
        context.drawImage(this.texture,           //image
                          0,                      //sx
                          0,                      //sy
                          tW,                     //sWidth
                          tH,                     //sHeight
                          this.x+xCount-OFFSET.x, //dx
                          this.y+yCount-OFFSET.y, //dy
                          tW,                     //dWidth
                          tH);                    //dHeight

      }
    }

  }
};
///-------------------------------------------------------------------------------------------------AnimatedSprite
class AnimatedSprite extends Sprite{
    constructor(x=0,y=0,w=64,h=64){
        super(x,y,w,h);
        this.xV = 0;
        this.yV = 0;
        this.jumping = true;
        this.running = false;
        this.speed = 1;
        this.jumpHeight = 50;
        this.weight = 2;
        this.friction = 0.9;
    }
    lastLocation(steps){
        // alert(steps);
        // return new Rectangle(this.x - this.xV * steps,this.y - this.yV * steps,this.w,this.h);
        return new Rectangle(this.x - this.xV,this.y - this.yV,this.w,this.h);

    }
    nextLocation(steps){
        // return new Rectangle(this.x + this.xV * steps,this.y + this.yV * steps,this.w,this.h);
        return new Rectangle(this.x + this.xV,this.y + this.yV,this.w,this.h);

    }
    move(){
        this.x += this.xV;
        this.y += this.yV;
        this.yV += GRAVITY;
        this.xV *= FRICTION;
        this.yV *= FRICTION;
        this.checkBottom();
        // this.draw();
    }
    checkBottom(){
      const standing_level = FLOOR_LEVEL - this.h * 1.5;
      // if this is falling below floor line
      if (this.y > standing_level) {
          this.jumping = false;
          this.y = standing_level;
          this.yV = 0;
      }
    }
    checkEdgeWrap(){
      // if this is going off the left of the screen
      if (this.x < -this.w){//-20) {
          this.x = FRAME_WIDTH;
      } else if (this.x > FRAME_WIDTH) {// if this goes past right boundary
          this.x = -20;
      }
    }
    collide(object){
        if(this.nextLocation().overlaps(object)){
            const prevPosition = this.lastLocation(1);
          ///-standing on
          if(prevPosition.y < object.y){
            this.y = object.y - this.h;
            this.yV = 0;
            this.jumping = false;
          ///-oof, my head!
          } else if(prevPosition.y  > object.y + object.h){
            //   console.log('under');
            this.y = prevPosition.y + prevPosition.h;//object.y + object.h + 1;
            this.yV = 0;
            // this.jumping = false;
          }
          ///-butting up against --from the left
          else if(prevPosition.x + this.w < object.x + object.w){
            this.x = object.x - this.w;
            this.xV = 0;
            // this.jumping = false;
          ///--from the right
          } else if(prevPosition.x > object.x){
            this.x = object.x + object.w;
            this.xV = 0;
            // this.jumping = false;
          }
    
        }
      }
};
///-------------------------------------------------------------------------------------------------Player
class Player extends AnimatedSprite{
  constructor(x=0,y=0,w=32,h=32){
      super(x,y,w,h);
      this.startX = Math.floor(FRAME_WIDTH / 2);
      this.startY = FLOOR_LEVEL - 300;
  }
  move(){
    const OFFSET_SPEED = 2;
    const maxRight = FRAME_WIDTH * 0.75;
    const maxLeft = FRAME_WIDTH * 0.25;
    const maxTop = FRAME_HEIGHT * 0.25;
    const maxBottom = FRAME_HEIGHT * 0.75;
    ///-going off the screen - screen catches up
    if(this.x > maxRight + OFFSET.x && OFFSET.x < STAGE_WIDTH){
      if(this.xV > 0){
        OFFSET.x += this.xV;
      }
      // OFFSET.x += this.xV;
    } 
    if(this.x < maxLeft + OFFSET.x && OFFSET.x > 0){
      if(this.xV < 0){
        OFFSET.x += this.xV;
      }
      // OFFSET.x += this.xV;
    }
    if(this.y < maxTop + OFFSET.y && OFFSET.y > -STAGE_HEIGHT){
      if(this.yV < 0){
        OFFSET.y += this.yV;
      }
      // OFFSET.y += this.yV;
    }
    if(this.y > maxBottom + OFFSET.y && OFFSET.y < 0){
      if(this.yV > 0){
        OFFSET.y += this.yV;
      }
      // OFFSET.y += this.yV;
    }
    ///-if player is at the edge of the stage, stop
    if(this.x < 0){
      this.xV = 0;
      this.x = 0;
    }
    if(this.x + this.width > STAGE_WIDTH){
      this.xV = 0;
      this.x = STAGE_WIDTH;
    }
    if(this.y + this.width > STAGE_HEIGHT){
      this.yV = 0;
      this.y = STAGE_HEIGHT;
    }
    this.x += this.xV;
    this.y += this.yV;
    this.yV += GRAVITY;
    this.xV *= FRICTION;
    this.yV *= FRICTION;
    displayText(`x: ${Math.floor(this.x)} y: ${Math.floor(this.y)} OFFSET_X: ${Math.floor(OFFSET.x)} OFFSET_Y: ${Math.floor(OFFSET.y)}`);
  }
  control(){
      if (controller.up && !this.jumping) {
        this.yV = -this.jumpHeight;
        this.jumping = true;   
      }
      if(controller.run){
        this.speed = 2;
      } else {
        this.speed = 1;
      }
      if (controller.left) {
        this.xV -= 0.5 * this.speed;
      }
      if (controller.right) {
        this.xV += 0.5 * this.speed;
      }
      this.move();
  }

};

class Stage{
  constructor(canvas){
    this.canvas = canvas;
    this.frameWidth = 400;
    this.frameHeight = 1220;
    this.stageWidth = this.frameWidth * 10;
    this.stageHeight = this.frameHeight * 10;
    this.player1 = new Player();
    this.player1.color = colors.purple;
  }
  addSprite(sprite){
    this.sprites.push(sprite);
  }
  addBackground(background){
    this.texture = background;
  }
  drawSprites(){
    for(let sprite of this.sprites){
      sprite.applyTexture(true);
      this.player1.collide(sprite);
    }
  }
  drawFrame(){
    this.drawSprites();
    this.player1.control();
    this.player1.move();
    this.player1.applyColor();
  }

}

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Test Loop
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


const testLoop = function(){

}

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Main Loop
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const loop = function () {
  drawFrame();
  drawImageToCanvas(textures.clouds,canvas);
  player1.control();
  player1.move();
  player1.applyColor();
  for(let sprite of sprites){
    sprite.applyTexture(true);
    player1.collide(sprite);
  }
  window.requestAnimationFrame(loop);
};

///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|||||||||////////////////////////////////////////
///                                   Initial Setup
//////////////////////////////////////|||||||||\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const sprites = [];
for(let count = 1; count < 10; count += 2){
  sprites.push(new Sprite(count * 100 + 600, FLOOR_LEVEL - count * 100, 300, 32));
}
///ground
sprites.push(new Sprite(0,FLOOR_LEVEL - 16, STAGE_WIDTH, 32));
///wide block
sprites.push(new Sprite(2000,FLOOR_LEVEL - 150, 300,100));
s.wait(()=>{
  for(let sprite of sprites){
    sprite.texture = textures.bricks;
  }
  console.log('ready now');
},1000);
const player1StartX = Math.floor(FRAME_WIDTH / 2);
const player1StartY = FLOOR_LEVEL - 300;
const player1Height = 50;
const player1Width = 32;

const player1 = new Player(player1StartX,player1StartY,player1Width,player1Height);
player1.color = "#88cc88";


window.requestAnimationFrame(loop);





