// Seeds
// 1303549530 dark purple

var options = {
  seed: getRandomInt(0, Math.pow(2, 32)),
  originX: 0,
  originY: 0,
  cellSize: 6,
  gutterSize: 0,
  showMenu: false,
  hideMenuButton: true,
  drawWalls: false,
  wallWidth: 1,
  outline: false,
  colorOne: {
    r: 0,
    g: 0,
    b: 0
  },
  colorTwo: {
    r: 0,
    g: 0,
    b: 0
  },
  randomStart: true,
  startX: 0,
  startY: 0,
  colorMode: 1,
  showStart: false,
  animSpeed: 0.25,
  animColor: false,
  autoplay: true
};

var colorOpts = {
  reset: true,
  colorOneFrom: { r: 0, g: 0, b: 0 }, //original start color
  colorOneTo: { r: 0, g: 0, b: 0 }, //new start color
  colorTwoFrom: { r: 0, g: 0, b: 0 }, //original end color
  colorTwoTo: { r: 0, g: 0, b: 0 }, //new end color
  lerpPercentage: 0 //lerp percentage (how far through the lerp we are)
};

var seed = options.seed; //40
var maze, canvas, context, imageData, currentAnimationFrame;
var isAnimating = false;

function zeroStart() {
  options.startX = 0;
  options.startY = 0;
  init(options);
}

//These values will be set to random in resize
function randomStart() {
  var d = calculateMazeDimensions();
  options.startX = getRandomInt(0, d.x);
  options.startY = getRandomInt(0, d.y);
  init(options);
}

function randomSeed() {
  options.seed = getRandomInt(0, Math.pow(2, 32));
  init(options);
}

function toggleAnimate() {
  if (isAnimating) stopAnim();
  else startAnim();
}

function stopAnim() {
  if (isAnimating) {
    isAnimating = false;
    window.cancelAnimationFrame(currentAnimationFrame);
  }
}

function startAnim() {
  if (!isAnimating) {
    isAnimating = true;
    animate();
  }
}

function animate() {
  animateFrame();
  currentAnimationFrame = window.requestAnimationFrame(animate);
}

function animateFrame() {
  if (options.animColor) shiftColor(options.animSpeed, false);

  if (maze != undefined && context != undefined) {
    maze.draw(context, options, options.animSpeed / 100);
  }
}

//Sets new taret colors and lerps the current colors to them, restarting when
// the target and current colors are the same
function shiftColor(shift, redraw) {
  if (colorOpts.reset) {
    colorOpts.reset = false;
    colorOpts.lerpPercentage = 0;
    copyColor(options.colorOne, colorOpts.colorOneFrom);
    copyColor(options.colorTwo, colorOpts.colorTwoFrom);
    colorOpts.colorOneTo = randomSeededColor();
    colorOpts.colorTwoTo = randomSeededColor();
  }

  if (colorOpts.lerpPercentage >= 100) {
    copyColor(colorOpts.colorTwoTo, colorOpts.colorTwoFrom);
    colorOpts.colorTwoTo = randomSeededColor();

    copyColor(colorOpts.colorOneTo, colorOpts.colorOneFrom);
    colorOpts.colorOneTo = randomSeededColor();

    colorOpts.lerpPercentage = 0;
  }

  colorOpts.lerpPercentage += shift;

  options.colorOne = lerp_color(
    colorOpts.colorOneFrom,
    colorOpts.colorOneTo,
    colorOpts.lerpPercentage
  );
  options.colorTwo = lerp_color(
    colorOpts.colorTwoFrom,
    colorOpts.colorTwoTo,
    colorOpts.lerpPercentage
  );

  if (redraw && maze != undefined && context != undefined) {
    maze.draw(context, options, 0);
  }
}

window.onload = function() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  window.addEventListener(
    "resize",
    function() {
      init(options);
    },
    false
  );
  init(options);

  canvas.style.background = "white";
};

function calculateMazeDimensions() {
  var dim = { x: 0, y: 0 };

  if (canvas != undefined) {
    dim.x = Math.floor(canvas.width / (options.cellSize + options.gutterSize));
    dim.y = Math.floor(canvas.height / (options.cellSize + options.gutterSize));
  }

  return dim;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function init(options) {
  var wasAnim = isAnimating;
  if (wasAnim) {
    stopAnim();
  }

  if (canvas == undefined || context == undefined) return;

  verifyOptions();

  seed = options.seed;

  var backing = document.getElementById("maze-backing");
  var style = window.getComputedStyle(backing);
  console.log(style.width, style.height);
  canvas.width = parseInt(style.width.replace("px", ""), 10) * 1.01; // Account for rounding issues and insure it's full-width
  canvas.height = parseInt(style.height.replace("px", ""), 10);

  var d = calculateMazeDimensions();

  options.colorOne = randomSeededAccessibleColor();
  canvas.style.background = "";
  options.colorTwo = randomSeededAccessibleColor();
  var loops = 0;
  while (loops < 500 && contrast(options.colorOne, options.colorTwo) < 2) {
    options.colorTwo = randomSeededAccessibleColor();
    loops++;
  }

  console.log(loops, contrast(options.colorOne, options.colorTwo));

  colorOpts.reset = true;

  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  maze = new Maze(d.x, d.y, options);

  maze.draw(context, options);

  if (wasAnim || options.autoplay) {
    startAnim();
  }
}

function Vertex(x, y) {
  this.x = x;
  this.y = y;
  this.visited = false;
  this.adj = [];
  this.walls = [];
  this.depth = 1;

  //draw variables
  this.wallWidth = 0;
  this.drawX = 0;
  this.drawY = 0;
  this.colorMod = 0;
  this.r = 0;
  this.g = 0;
  this.b = 0;

  //removes the wall between this and vertex, adding it to the adjacency list
  this.breakWall = function(vertex, log) {
    var index = -1;
    this.walls.forEach(function(v, i) {
      if (v.y == vertex.y && v.x == vertex.x) {
        if (log) console.log("\tmatch found at index: " + i);
        index = i;
      }
    });
    this.adj.push(this.walls.splice(index, 1)[0]);
  };

  //draw function for display
  this.draw = function(context, o, shiftDepth, maxDepth) {
    //do depth shifting (animation) in here to avoid looping twice
    if (shiftDepth != 0) {
      this.depth = Math.floor((this.depth + shiftDepth) % maxDepth);
    }

    this.wallWidth = o.drawWalls ? o.wallWidth : 0;
    this.drawX = this.wallWidth + o.originX + (o.cellSize + o.gutterSize) * x;
    this.drawY = this.wallWidth + o.originY + (o.cellSize + o.gutterSize) * y;

    switch (o.colorMode) {
      case 0: //End to end color
        this.colorMod = this.depth / o.maxDepth;
        break;
      case 1: //Cyclic color
        if (this.depth < o.maxDepth / 2)
          this.colorMod = (this.depth / o.maxDepth) * 2;
        else this.colorMod = (1 - this.depth / o.maxDepth) * 2;
        break;
      case 2:
        this.colorMod = this.depth / o.maxDepth / 0.5 - 0.5;
        break;
      case 3:
        this.colorMod = 0.5 - this.depth / o.maxDepth;
        break;
    }

    this.r = o.colorOne.r + (o.colorTwo.r - o.colorOne.r) * this.colorMod;
    this.g = o.colorOne.g + (o.colorTwo.g - o.colorOne.g) * this.colorMod;
    this.b = o.colorOne.b + (o.colorTwo.b - o.colorOne.b) * this.colorMod;

    //Color the starting cell inverted
    if (options.showStart && x == options.startX && y == options.startY) {
      this.r = 255 - this.r;
      this.b = 255 - this.b;
      this.g = 255 - this.g;
    }

    //fill
    drawRect(
      this.r,
      this.g,
      this.b,
      this.drawX,
      this.drawY,
      this.drawX + o.cellSize,
      this.drawY + o.cellSize
    );
  };

  var wallIndex;
  this.drawWalls = function(context, options) {
    this.wallWidth = options.drawWalls ? options.wallWidth : 0;
    this.drawX =
      this.wallWidth +
      options.originX +
      (options.cellSize + options.gutterSize) * x;
    this.drawY =
      this.wallWidth +
      options.originY +
      (options.cellSize + options.gutterSize) * y;

    for (wallIndex = this.walls.length - 1; wallIndex >= 0; wallIndex--) {
      if (this.walls[wallIndex].x == x - 1 && this.walls[wallIndex].y == y) {
        drawRect(
          0,
          0,
          0, //255, 255, 255,
          this.drawX - this.wallWidth - options.gutterSize,
          this.drawY - this.wallWidth - options.gutterSize,
          this.drawX -
            this.wallWidth -
            options.gutterSize +
            2 * this.wallWidth +
            options.gutterSize,
          this.drawY -
            this.wallWidth -
            options.gutterSize +
            2 * this.wallWidth +
            2 * options.gutterSize +
            options.cellSize
        );
      } else if (
        this.walls[wallIndex].x == x &&
        this.walls[wallIndex].y == y - 1
      ) {
        drawRect(
          0,
          0,
          0, //255, 255, 255,
          this.drawX - this.wallWidth - options.gutterSize,
          this.drawY - this.wallWidth - options.gutterSize,
          this.drawX -
            this.wallWidth -
            options.gutterSize +
            2 * this.wallWidth +
            2 * options.gutterSize +
            options.cellSize,
          this.drawY -
            this.wallWidth -
            options.gutterSize +
            2 * this.wallWidth +
            options.gutterSize
        );
      }
    }
  };
}

var drawX = 0,
  drawY = 0; //avoid new vars to avoid GC
function drawRect(r, g, b, startX, startY, endX, endY) {
  for (drawX = startX; drawX < endX; drawX++) {
    for (drawY = startY; drawY < endY; drawY++) {
      setPixel(drawX, drawY, r, g, b);
    }
  }
}

function setPixel(x, y, r, g, b) {
  var offset = (x + y * imageData.width) * 4;
  imageData.data[offset + 0] = r;
  imageData.data[offset + 1] = g;
  imageData.data[offset + 2] = b;
  imageData.data[offset + 3] = 255;
}

function drawOut() {
  context.putImageData(imageData, 0, 0);
}

function Maze(w, h, options) {
  this.w = w;
  this.h = h;

  //setup the grid
  this.grid = new Array(h);
  for (var g_y = 0; g_y < this.grid.length; g_y++) {
    this.grid[g_y] = new Array(w);
    for (var g_x = 0; g_x < this.grid[g_y].length; g_x++) {
      this.grid[g_y][g_x] = new Vertex(g_x, g_y);

      if (g_x > 0) {
        //left
        this.grid[g_y][g_x].walls.push({ x: g_x - 1, y: g_y });
      }
      if (g_x < w - 1) {
        //right
        this.grid[g_y][g_x].walls.push({ x: g_x + 1, y: g_y });
      }
      if (g_y > 0) {
        //top
        this.grid[g_y][g_x].walls.push({ x: g_x, y: g_y - 1 });
      }
      if (g_y < h - 1) {
        //bottom
        this.grid[g_y][g_x].walls.push({ x: g_x, y: g_y + 1 });
      }
    }
  }

  //Returns a random unvisited neighbor of the given vertex
  this.randomWalledNeighbor = function(grid, vertex) {
    var valid = vertex.walls.filter(function(v) {
      return !grid[v.y][v.x].visited;
    });

    if (valid.length < 1) return -1;

    return valid[getRandomSeededInt(0, valid.length)];
  };

  //Mazify - see http://www.algosome.com/articles/maze-generation-depth-first.html
  //1 Randomly select a node (or cell) N.
  var n = { x: 0, y: 0 },
    q = [];
  while (n != null) {
    //2 Push the node N onto a queue Q.
    q.push(n);

    //3 Mark the cell N as visited.
    this.grid[n.y][n.x].visited = true;

    //4 Randomly select an adjacent cell A of node N that has not been visited.
    var neighbor = this.randomWalledNeighbor(this.grid, this.grid[n.y][n.x]);
    while (neighbor == -1) {
      //If all the neighbors of N have been visited:
      //  Continue to pop items off the queue Q until a node is
      //      encountered with at least one non-visited neighbor - assign
      //      this node to N and go to step 4.
      //  If no nodes exist: stop.
      if (q.length <= 1) break;

      q.shift();
      n = q[0];
      neighbor = this.randomWalledNeighbor(
        this.grid,
        this.grid[q[0].y][q[0].x]
      );
    }

    if (q.length <= 1 && neighbor == -1) break;

    //5 Break the wall between N and A.
    this.grid[n.y][n.x].breakWall(neighbor);
    this.grid[neighbor.y][neighbor.x].breakWall(n);

    //6 Assign the value A to N.
    n = neighbor;

    //7 Go to step 2.
  }

  //Run a DFS on the resulting maze to generate the depth values
  // use visited as though it were inverse as it was flipped in the generation algo
  this.maxDepth = 0;
  var v = {};

  //We always need to generate these, otherwise we lose seed consistency
  v.x = getRandomSeededInt(0, w);
  v.y = getRandomSeededInt(0, h);

  if (options.randomStart == false) {
    v = { x: options.startX, y: options.startY };
  } else {
    options.startX = v.x;
    options.startY = v.y;
  }

  // use iterative dfs to avoid js callstack limits
  v.d = 0;
  iterDFS(this, v);
  function iterDFS(maze, v) {
    var s = [];
    s.push(v);
    while (s.length > 0) {
      v = s.pop();
      if (maze.grid[v.y][v.x].visited == true) {
        maze.grid[v.y][v.x].visited = false;
        maze.grid[v.y][v.x].depth = v.d;
        if (v.d > maze.maxDepth) maze.maxDepth = v.d;
        maze.grid[v.y][v.x].adj.forEach(function(a) {
          s.push({ x: a.x, y: a.y, d: v.d + 1 });
        });
      }
    }
  }

  var x, y;

  //Draw function for display
  this.draw = function(context, options, shiftDepth) {
    if (shiftDepth == undefined) shiftDepth = 0;
    else shiftDepth *= this.maxDepth;

    //add room for gutters and walls to origin
    options.originX += options.gutterSize;
    options.originY += options.gutterSize;

    options.maxDepth = this.maxDepth;

    //draw squares
    for (y = 0; y < this.grid.length; y++) {
      for (x = 0; x < this.grid[y].length; x++) {
        this.grid[y][x].draw(context, options, shiftDepth, this.maxDepth);
      }
    }

    //Draw walls seperately to avoid overlap
    if (options.drawWalls) {
      for (y = 0; y < this.grid.length; y++) {
        for (x = 0; x < this.grid[y].length; x++) {
          this.grid[y][x].drawWalls(context, options);
        }
      }
    }

    //Draw an outline around the grid
    if (options.outline == true) {
      context.lineWidth = options.wallWidth * 2;
      context.strokeStyle = options.wallColor;
      context.strokeRect(
        options.originX + (options.drawWalls ? options.wallWidth : 0), // - options.wallWidth,
        options.originY + (options.drawWalls ? options.wallWidth : 0), // - options.wallWidth
        (options.cellSize + options.gutterSize) * this.grid[0].length,
        (options.cellSize + options.gutterSize) * this.grid.length
      );
    }

    drawOut();
  };
}

function verifyOptions() {
  //Default some options
  if (options.originX == undefined) options.originX = 0;
  if (options.originY == undefined) options.originY = 0;
  if (options.cellSize == undefined) options.cellSize = 4;
  if (options.gutterSize == undefined) options.gutterSize = 0;
  if (options.colorOne == undefined)
    options.colorOne = {
      red: 0,
      green: 153,
      blue: 0
    };
  if (options.colorTwo == undefined)
    options.colorTwo = {
      red: 0,
      green: 255,
      blue: 153
    };
  if (options.wallWidth == undefined) options.wallWidth = 1;
  if (options.wallColor == undefined) options.wallColor = "black";
}

//================== Utility =================
//http://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
function saveToDisk() {
  if (canvas != undefined) {
    // here is the most important part because if you dont replace you will get a DOM 18 exception.
    var image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    window.location.href = image; // it will save locally
  }
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomSeededInt(min, max) {
  return Math.floor(seededRandom() * (max - min)) + min;
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//http://stackoverflow.com/questions/521295/javascript-random-seeds
// rpovides seeded random values
var randX = 0; //avoid new vars to avoid GC
function seededRandom() {
  randX = Math.sin(seed++) * 10000;
  return randX - Math.floor(randX);
}

function luminanace(r, g, b) {
  var a = [r, g, b].map(function(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
  // minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
  return (
    (luminanace(rgb1.r, rgb1.g, rgb1.b) + 0.05) /
    (luminanace(rgb2.r, rgb2.g, rgb2.b) + 0.05)
  );
}

const WHITE = { r: 255, g: 255, b: 255 };
function randomSeededAccessibleColor() {
  var color;
  var loop = 0;
  do {
    color = randomSeededColor();
    loop++;
  } while (loop < 50 && contrast(WHITE, color) < 4.5);
  return color;
}

function randomSeededColor() {
  return {
    r: getRandomSeededInt(0, 255),
    g: getRandomSeededInt(0, 255),
    b: getRandomSeededInt(0, 255)
  };
}

function randomColor() {
  return {
    r: getRandomInt(0, 255),
    g: getRandomInt(0, 255),
    b: getRandomInt(0, 255)
  };
}

function max(i1, i2) {
  return i1 > i2 ? i1 : i2;
}

function min(i1, i2) {
  return i1 < i2 ? i1 : i2;
}

//returns the color which is p between c1 and c2
function lerp_color(c1, c2, p) {
  var d = p / 100;
  var r = {
    r: c1.r + (c2.r - c1.r) * d,
    g: c1.g + (c2.g - c1.g) * d,
    b: c1.b + (c2.b - c1.b) * d
  };
  return r;
}

function copyColor(from, to) {
  to.r = from.r;
  to.g = from.g;
  to.b = from.b;
}

function sameColor(c1, c2) {
  return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b;
}
