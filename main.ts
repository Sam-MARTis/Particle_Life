const INTERACTION_MATRIX = [
  [-1, 2],
  [-2, 1],
];

const FORCE_MULTIPLIER = 2;
const VISCOSITY = 0.1;
const TREE_CAPACITY = 4;
const DISTANCE_SCALE = 100

class Fluid {
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
  fluid: Fluid;
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
    _fluid: Fluid,
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
    this.fluid = _fluid;
    this.force = [0, 0];
    this.distanceStep = _distanceStep;
    this.interactionMatrix = _interactionMatrix;
  }
  addForceInteractionOfParticle = (other: Point): void => {
    const coefficient = this.interactionMatrix[this.type][other.type];
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distanceSquared = dx ** 2 + dy ** 2 / this.distanceStep ** 2;
    if (distanceSquared == 0) return;
    const angle = Math.atan2(dy, dx);
    const force = coefficient / distanceSquared;
    this.force[0] += force * Math.cos(angle);
    this.force[1] += force * Math.sin(angle);
  };
  update = (dt: number):void => {
    this.x += this.vx/2*dt;
    this.y += this.vy/2*dt;
    this.vx += this.force[0]*dt / this.mass;
    this.vy += this.force[1]*dt / this.mass;
    this.x += this.vx/2*dt;
    this.y += this.vy/2*dt;
    this.force = [0, 0];
  }


}

const f1 = new Fluid(0, 0, 1000, 1000, VISCOSITY, []);
const p1 = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
const p2 = new Point(1, 1, 200, 600, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
p1.addForceInteractionOfParticle(p2);
console.log(p1.force);

addEventListener("mousemove", (e) => {
  const p = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
  p.addForceInteractionOfParticle(
    new Point(1, 1, e.offsetX, e.offsetY, 0, 0, 0, f1, 300, INTERACTION_MATRIX)
  );
  console.log(p.force, e.offsetX, e.offsetY);
});
