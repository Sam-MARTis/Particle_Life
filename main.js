"use strict";
const INTERACTION_MATRIX = [
    [-1, 2],
    [-2, 1],
];
const FORCE_MULTIPLIER = 2;
const VISCOSITY = 0.1;
class Fluid {
    constructor(_viscosity) {
        this.viscosity = _viscosity;
        this.objects = [];
    }
}
class Point {
    constructor(_position, _mass, _velocity, _type, _fluid, _distanceStep, _interactionMatrix) {
        this.findInteractionOfParticle = (other) => {
            let coefficient = this.interactionMatrix[this.type][other.type];
            let dx = other.position[0] - this.position[0];
            let dy = other.position[1] - this.position[0];
            let distanceSquared = (dx ** 2) + (dy ** 2);
            let angle = Math.atan2(dy, dx);
            let force = coefficient / distanceSquared;
            this.force[0] += force * Math.cos(angle);
            this.force[1] += force * Math.sin(angle);
        };
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
