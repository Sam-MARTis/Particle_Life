const INTERACTION_MATRIX = [
  [1, 1],
  [-10, 5],
];

const FORCE_MULTIPLIER = 0.1;
const VISCOSITY = 10;
const TREE_CAPACITY = 4;
const DISTANCE_SCALE = 5;
const BUFFER_SIZE = 0;
const TIME_STEP = 0.01;
const POINTS_COUNT = 100;
const PARTICLE_SIZE = 5;
const SEARCH_RANGE_MULTIPLIER = 50;
const MAX_FORCE = 1;
const MAX_VELOCITY = 1;
const COLLISION_RANGE_MULTIPLIER = 3;
const MASS_OF_PARTICLES = 100;

class Arena {
  x: number;
  y: number;
  width: number;
  height: number;
  viscosity: number;
  objects: Point[];
  tree: QuadTree;
  constructor(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    _viscosity: number,
    _objects: Point[] = []
  ) {
    this.viscosity = _viscosity;
    this.objects = [];
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
    this.objects = _objects;
    this.tree = new QuadTree(
      this.x,
      this.y,
      this.width,
      this.height,
      TREE_CAPACITY
    );
  }
  addPoint = (point: Point): void => {
    this.objects.push(point);
    this.tree.addPoint(point);
  };

  updateForcesAndCollisionOfSingleParticle = (point: Point) => {
    const pointsToCheckForForce = this.tree.queryTree(
      point.x - SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE,
      point.y - SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE,
      point.x + SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE,
      point.y + SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE
    );
    
    for (const other of pointsToCheckForForce) {
      point.addForceInteractionOfParticle(other);
    }
  };

  updateAll = (dt: number): void => {
    
    this.tree = new QuadTree(0, 0, this.width, this.height, TREE_CAPACITY);
    this.objects.forEach((point) => {
      this.tree.addPoint(point);
    });
    this.objects.forEach((point) => {
      this.updateForcesAndCollisionOfSingleParticle(point);
    });
    this.objects.forEach((point) => {
      point.update(dt);
    });
    this.objects.forEach((point) => {
      const pointsToCheckForCollision = this.tree.queryTree(
        point.x - 2 * point.size,
        point.y - 2 * point.size,
        point.x + 2 * point.size,
        point.y + 2 * point.size
      );
      
      pointsToCheckForCollision.forEach((other) =>{
        point.handleCollision(other);
      })
    })

  };
}

class Point {
  mass: number;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: number;
  force: [number, number];
  arena: Arena;
  interactionMatrix: number[][];
  distanceStep: number;

  constructor(
    _mass: number,
    _size: number,
    _x: number,
    _y: number,

    _vx: number,
    _vy: number,
    _type: number,
    _arena: Arena,
    _distanceStep: number,
    _interactionMatrix: number[][]
  ) {
    this.mass = _mass;
    this.size = _size;
    this.x = _x;
    this.y = _y;
    this.vx = _vx;
    this.vy = _vy;
    this.type = _type;
    this.arena = _arena;
    this.force = [0, 0];
    this.distanceStep = _distanceStep;
    this.interactionMatrix = _interactionMatrix;
  }
  addForceInteractionOfParticle = (other: Point): void => {
    const coefficient = this.interactionMatrix[this.type][other.type];
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distanceSquared = (dx ** 2 + dy ** 2) / this.distanceStep ** 2;
    if (distanceSquared == 0) return;

    const angle = Math.atan2(dy, dx);
    let force = coefficient / distanceSquared;
    force = force > MAX_FORCE ? MAX_FORCE : force;

    this.force[0] += force * Math.cos(angle);
    this.force[1] += force * Math.sin(angle);
    this.force[0] = this.force[0] > MAX_FORCE ? MAX_FORCE : this.force[0];
    this.force[1] = this.force[1] > MAX_FORCE ? MAX_FORCE : this.force[1];
  };
  update = (dt: number): void => {
    this.force[0] -= this.vx * VISCOSITY;
    this.force[1] -= this.vy * VISCOSITY;
    this.vx += (this.force[0] * dt) / this.mass;
    this.vy += (this.force[1] * dt) / this.mass;
    if (this.vx > MAX_VELOCITY) {
      this.vx = MAX_VELOCITY;
    }
    if (this.vy > MAX_VELOCITY) {
      this.vy = MAX_VELOCITY;
    }
    if (this.vx < -MAX_VELOCITY) {
      this.vx = -MAX_VELOCITY;
    }
    if (this.vy < -MAX_VELOCITY) {
      this.vy = -MAX_VELOCITY;
    }

    // this.x += (this.vx / 2) * dt;
    // this.y += (this.vy / 2) * dt;

    this.x += (this.vx ) * dt;
    this.y += (this.vy ) * dt;
    this.vx = this.vx > MAX_VELOCITY ? MAX_VELOCITY : this.vx;
    this.vy = this.vy > MAX_VELOCITY ? MAX_VELOCITY : this.vy;
    if (this.x > widthMain -1) {
      this.x = 1;
      // this.vx *= -1;
    }
    if (this.x < 0) {
      this.x = widthMain - 2;
      // this.vx *= -1;
    }
    if (this.y > heightMain - 1) {
      this.y = 1;
      // this.vy *= -1;
    }
    if (this.y < 0) {
      this.y = heightMain - 2;
      // this.vy *= -1;
    }

    // this.x = this.x<0?0:this.x;
    // this.y = this.y<0?0:this.y;
    // this.x = this.x>(widthMain-1)?(widthMain-1):this.x
    // this.y = this.y>(heightMain-1)?(heightMain-1):this.y

    this.force = [0, 0];
  };

  handleCollision = (other: Point): void => {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distanceSquared = dx ** 2 + dy ** 2;
    if (distanceSquared == 0) return;
    if (distanceSquared <= ((this.size + other.size + 2) ** 2)){
      const angle = Math.atan2(dy, dx);
      const overlap = 2*this.size - Math.sqrt(distanceSquared) + BUFFER_SIZE;
      this.x -= 0.5*(overlap * Math.cos(angle));
      this.y -= 0.5*(overlap * Math.sin(angle));
      other.x +=0.5* (overlap * Math.cos(angle));
      other.y +=0.5* (overlap * Math.sin(angle));
    }
  };
}

const canvas = document.getElementById("projectCanvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Canvas not found");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Context not found");
}

const widthMain = window.innerWidth * devicePixelRatio;
const heightMain = window.innerHeight * devicePixelRatio;
canvas.width = widthMain;
canvas.height = heightMain;

const arena: Arena = new Arena(0, 0, widthMain, heightMain, VISCOSITY, []);
const pointsArray: Point[] = [];
const drawTree = (tree: QuadTree): void => {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.rect(tree.x, tree.y, tree.width, tree.height);
  ctx.stroke();

  if (tree.divided) {
    tree.subTrees.forEach((subTree) => {
      drawTree(subTree);
    });
  }
};
const renderFunction = () => {
  ctx.clearRect(0, 0, widthMain, heightMain);
  for (const point of pointsArray) {
    ctx.fillStyle = point.type ? "green" : "red";
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, 2 * 3.1416);
    ctx.fill();
  }
  drawTree(arena.tree);
};
let timeNow = performance.now();
const mainLoop = (): void => {
  const newTime = performance.now();
  arena.updateAll(newTime - timeNow);
  timeNow = newTime;
  renderFunction();
  requestAnimationFrame(mainLoop);
};
const setup = (): void => {
  //Create Aerna.
  //Add particles
  //Call animation to update particles

  for (let i = 0; i < POINTS_COUNT; i++) {
    const pointNew = new Point(
      MASS_OF_PARTICLES,
      PARTICLE_SIZE,
      Math.random() * widthMain,
      Math.random() * heightMain,
      0,
      0,
      Math.round(Math.random()),
      arena,
      DISTANCE_SCALE,
      INTERACTION_MATRIX
    );
    arena.addPoint(pointNew);
    pointsArray.push(pointNew);
  }
  timeNow = performance.now();
  mainLoop();
};

/*
//Testing
const f1 = new Arena(0, 0, 1000, 1000, VISCOSITY, []);
const p1 = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
const p2 = new Point(1, 1, 200, 600, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
p1.addForceInteractionOfParticle(p2);
console.log(p1.force);
*/

setup();
const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};
