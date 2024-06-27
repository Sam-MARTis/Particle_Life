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
  position: [number, number];
  mass: number;
  velocity: [number, number];
  type: number;
  force: [number, number];
  fluid: Fluid;
  interactionMatrix: number[][];
  distanceStep: number;

  constructor(
    _position: [number, number],
    _mass: number,
    _velocity: [number, number],
    _type: number,
    _fluid: Fluid,
    _distanceStep: number,
    _interactionMatrix: number[][]
  ) {
    this.position = _position;
    this.mass = _mass;
    this.velocity = _velocity;
    this.type = _type;
    this.fluid = _fluid;
    this.force = [0, 0];
    this.distanceStep = _distanceStep;
    this.interactionMatrix = _interactionMatrix;
  }


}
