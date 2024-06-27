"use strict";
const INTERACTION_MATRIX = [
    [-1, 2],
    [-2, 1],
];
const FORCE_MULTIPLIER = 2;
const VISCOSITY = 0.1;
const TREE_CAPACITY = 4;
class Fluid {
    constructor(_x, _y, _width, _height, _viscosity, _objects) {
        this.viscosity = _viscosity;
        this.objects = [];
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
        this.objects = _objects;
        this.tree = new QuadTree(this.x, this.y, this.width, this.height, TREE_CAPACITY);
        this.tree.addPoints(_objects);
    }
}
class Point {
    constructor(_mass, _size, _x, _y, _vx, _vy, _type, _fluid, _distanceStep, _interactionMatrix) {
        this.findInteractionOfParticle = (other) => {
            let coefficient = this.interactionMatrix[this.type][other.type];
            let dx = other.x - this.x;
            let dy = other.y - this.y;
            let distanceSquared = dx ** 2 + dy ** 2 / this.distanceStep ** 2;
            if (distanceSquared == 0)
                return;
            let angle = Math.atan2(dy, dx);
            let force = coefficient / distanceSquared;
            this.force[0] += force * Math.cos(angle);
            this.force[1] += force * Math.sin(angle);
        };
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
}
let f1 = new Fluid(0, 0, 1000, 1000, VISCOSITY, []);
let p1 = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
let p2 = new Point(1, 1, 200, 600, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
p1.findInteractionOfParticle(p2);
console.log(p1.force);
addEventListener("mousemove", (e) => {
    let p = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
    p.findInteractionOfParticle(new Point(1, 1, e.offsetX, e.offsetY, 0, 0, 0, f1, 300, INTERACTION_MATRIX));
    console.log(p.force, e.offsetX, e.offsetY);
});
