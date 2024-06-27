const INTERACTION_MATRIX = [
  [-1, 2],
  [-2, 1],
];

const FORCE_MULTIPLIER = 2;
const VISCOSITY = 0.1;

class Fluid {
  viscosity: number;
  objects: Point[];
  constructor(_viscosity: number) {
    this.viscosity = _viscosity;
    this.objects = [];
  }
}

class Point {
  x:number;
  y:number
  mass: number;
  vx:number;
  vy: number;
  type: number;
  force: [number, number];
  fluid: Fluid;
  interactionMatrix: number[][];
  distanceStep: number;

  constructor(_mass: number, _x:number, _y:number,
    
    _vx:number,
    _vy: number,
    _type: number,
    _fluid: Fluid,
    _distanceStep: number,
    _interactionMatrix: number[][]
  ) {
    this.x = _x;
    this.y = _y;
    this.mass = _mass;
    this.vx = _vx;
    this.vy = _vy;
    this.type = _type;
    this.fluid = _fluid;
    this.force = [0, 0];
    this.distanceStep = _distanceStep;
    this.interactionMatrix = _interactionMatrix;
  }
  findInteractionOfParticle = (other: Point) => {
    let coefficient = this.interactionMatrix[this.type][other.type];
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let distanceSquared = dx ** 2 + dy ** 2 / this.distanceStep ** 2;
    if (distanceSquared == 0) return;
    let angle = Math.atan2(dy, dx);
    let force = coefficient / distanceSquared;
    this.force[0] += force * Math.cos(angle);
    this.force[1] += force * Math.sin(angle);
  };
  
}
