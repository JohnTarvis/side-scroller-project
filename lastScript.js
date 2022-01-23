
const keyCodes = {

  ///////////////////////////////////////////////////////////////////////////
  //-GAME KEYS
  ///////////////////////////////////////////////////////////////////////////
  backspace:  	8,          tab:        	9,          enter :	        13,         
  ctrl:           17,         alt:            18,         pauseBreak:     19,
  capsLock:       20,         _escape:        27,         pageUp:         33,
  space:          32,         pageDown:	    34,         end:            35,
  home:           36,         arrowLeft: 	    37,         arrowUp:    	38,
  arrowRight: 	39,         arrowDown:	    40,         printScreen: 	44,
  insert:         45,         delete:         46,         
  
  ///////////////////////////////////////////////////////////////////////////
  //-SHIFT
  ///////////////////////////////////////////////////////////////////////////
  shift:          16,
  
  ///////////////////////////////////////////////////////////////////////////
  //-NUMBERS
  ///////////////////////////////////////////////////////////////////////////
  _0:             48,         _1: 	        49,         _2:         	50,
  _3:             51,         _4: 	        52,         _5:         	53,
  _6:             54,         _7: 	        55,         _8:         	56,         
  _9:             57,
  
  ///////////////////////////////////////////////////////////////////////////
  //-LETTERS
  ///////////////////////////////////////////////////////////////////////////
  a: 	            65,         b:          	66,         c:          	67,
  d:          	68,         e:          	69,         f:          	70,
  g:          	71,         h:          	72,         i:          	73,
  j:              74,         k:          	75,         l:          	76,
  m:              77,         n:          	78,         o:          	79,
  p:              80,         q:          	81,         r:          	82,
  s:              83,         t:          	84,         u:          	85,
  v:              86,         w:	            87,         x:          	88,
  y:              89,         z:	            90,
  
  
  leftWindowKey: 	91,         rightWindowKey: 92,         selectKey: 	    93,
  
  ///////////////////////////////////////////////////////////////////////////
  //-NUMPAD
  ///////////////////////////////////////////////////////////////////////////
  numpad0:    	96,         numpad1:	    97,         numpad2:	    98,
  numpad3:    	99,         numpad4:	    100,        numpad5:	    101,
  numpad6:	    102,        numpad7:	    103,        numpad8:	    104,        
  numpad9:	    105,        
  multiply:	    106,        add: 	        107,        subtract: 	    109,        
  decimalPoint: 	110,        divide: 	    111,
  
  ///////////////////////////////////////////////////////////////////////////
  //-FKEYS
  ///////////////////////////////////////////////////////////////////////////
  f1: 	        112,        f2:	            113,        f3:             114,
  f4: 	        115,        f5:	            116,        f6:             117,
  f7: 	        118,        f8:	            119,        f9:             120,
  f10: 	        121,        f11:	        122,        f12:	        123,
  
  ///////////////////////////////////////////////////////////////////////////
  //-LOCKS
  ///////////////////////////////////////////////////////////////////////////
  numLock: 	    144,        scrollLock: 	145,        
  
  ///////////////////////////////////////////////////////////////////////////
  //-MEDIA
  ///////////////////////////////////////////////////////////////////////////
  myComputer_mk: 	182,        myCalculator_mk:183,
  
  ///////////////////////////////////////////////////////////////////////////
  //-PUNCTUATION
  ///////////////////////////////////////////////////////////////////////////
  semiColon:	    186,        equalSign: 	    187,        comma: 	        188,
  dash: 	        189,        period:	        190,        forwardSlash :	191,
  openBracket:	219,        backSlash:	    220,        closeBraket :	221,
  singleQuote :	222
};

const colors = {
    red:"#ff0000",
    blue:"#0000ff",
    green:"#00ff00",
    white:"#ffffff",
    black:"#000000",
    grey:"#888888",

    yellow:"#ffff00",
    purple:"#ff00ff",
    cyan:"#00ffff"
};

const TEXTURE_REPEATING = true;

const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 1220;

const STAGE_HEIGHT = 4000;
const STAGE_WIDTH = 12200;

const GRAVITY = 2;
const FRICTION = 0.9;

const FLOOR_LEVEL = 385;

const context = document.querySelector("canvas").getContext("2d");

context.canvas.height = FRAME_HEIGHT;
context.canvas.width = FRAME_WIDTH;

let OFFSET = {x:0,y:0};

function displayText(text){
  context.fillStyle = "red";
  context.font = "15px Arial";
  context.fillText(text, 10, 30);
}

function wait(f,ms){
  setTimeout(f,ms);
}

const textures = {};
function addNewTexture(name,filename){
  textures[name] = new Image();
  textures[name].src = filename;
  textures[name].addEventListener('load',()=>{
    textures[`${name}Repeat`] = context.createPattern(textures[name],'repeat');
  });
}
addNewTexture('bricks','bricks.jpg');

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

class Point{
    constructor(x=0,y=0){
        this.x = x;
        this.y = y;
    }
};

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
                    this.p1.y >= rectangle.p2.y    );
    }

};

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

// void ctx.drawImage(image, dx, dy);
// void ctx.drawImage(image, dx, dy, dWidth, dHeight);
// void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    if(repeating){
      const w = this.texture.width;
      const h = this.texture.height;

      // console.log('w ' + w + ' h ' + h)

      // const textureWidths = Math.ceil(this.w / w);
      // const textureHeights = Math.ceil(this.h / h);

      for(let x = 0; x < this.w; x += w){
        for(let y = 0; y < this.h; y += h){
          context.drawImage(this.texture,
            0,                          //source start x
            0,                //source start y
            this.w,           //source width
            this.h,           //source height
            this.x-OFFSET.x + x,  //destination x
            this.y-OFFSET.y + y,  //destination y
            this.w,           //destination width
            this.h);          //destination height
        }
      }

      console.log('repeating');


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

class AnimatedSprite extends Sprite{
    constructor(x=0,y=0,w=64,h=64){
        super(x,y,w,h);
        this.xV = 0;
        this.yV = 0;
        this.jumping = true;
        this.running = false;
        this.speed = 1;
        this.jumpHeight = 50;
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

class Player extends AnimatedSprite{
  constructor(x=0,y=0,w=32,h=32){
      super(x,y,w,h);
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


    // this.checkBottom();

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



function drawFrame(){
  context.fillStyle = "#201A23";
  context.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
  // drawFloor();
}

function drawFloor(){
  context.strokeStyle = "#2E2532";
  context.lineWidth = 30;
  context.beginPath();
  context.moveTo(0, FLOOR_LEVEL);
  context.lineTo(1220, FLOOR_LEVEL);
  context.stroke();
}

const sprites = [];
for(let count = 1; count < 10; count += 2){
  sprites.push(new Sprite(count * 100 + 600, FLOOR_LEVEL - count * 100, 300, 32));
}

///ground
sprites.push(new Sprite(0,FLOOR_LEVEL - 16, STAGE_WIDTH, 32));

wait(()=>{
  for(let sprite of sprites){
    sprite.texture = textures.bricks;
  }
  console.log('ready now');
},500);

// console.log(textures.bricksRepeat);

const loop = function () {

  drawFrame();
  player1.control();
  player1.move();
  player1.applyColor();

  for(let sprite of sprites){
    // sprite.applyTexture();
    sprite.applyTexture(true);
    player1.collide(sprite);
  }

  window.requestAnimationFrame(loop);

};

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const player1StartX = Math.floor(FRAME_WIDTH / 2);
const player1StartY = FLOOR_LEVEL;

const player1 = new Player(player1StartX,300);
player1.color = "#88cc88";

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);

window.requestAnimationFrame(loop);




