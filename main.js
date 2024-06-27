"use strict";
const INTERACTION_MATRIX = [
    [-1, 2],
    [-2, 1],
];
const FORCE_MULTIPLIER = 30;
const VISCOSITY = 0.1;
const TREE_CAPACITY = 4;
const DISTANCE_SCALE = 100;
const BUFFER_SIZE = 3;
const TIME_STEP = 0.1;
const POINTS_COUNT = 100;
class Arena {
    constructor(_x, _y, _width, _height, _viscosity, _objects = []) {
        this.addPoint = (point) => {
            this.objects.push(point);
            this.tree.addPoint(point);
        };
        this.updateForcesAndCollisionOfSingleParticle = (point) => {
            const pointsToCheckForForce = this.tree.queryTree(point.x - 3 * DISTANCE_SCALE, point.y - 3 * DISTANCE_SCALE, point.x + 3 * DISTANCE_SCALE, point.y + 3 * DISTANCE_SCALE);
            const pointsToCheckForCollision = this.tree.queryTree(point.x - 2 * point.size, point.y - 2 * point.size, point.x + 2 * point.size, point.y + 2 * point.size);
            for (const other of pointsToCheckForCollision) {
                point.handleCollision(other);
            }
            for (const other of pointsToCheckForForce) {
                point.addForceInteractionOfParticle(other);
            }
        };
        this.updateAll = (dt) => {
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
        };
        this.viscosity = _viscosity;
        this.objects = [];
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
        this.objects = _objects;
        this.tree = new QuadTree(this.x, this.y, this.width, this.height, TREE_CAPACITY);
    }
}
class Point {
    constructor(_mass, _size, _x, _y, _vx, _vy, _type, _arena, _distanceStep, _interactionMatrix) {
        this.addForceInteractionOfParticle = (other) => {
            const coefficient = this.interactionMatrix[this.type][other.type];
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distanceSquared = (dx ** 2 + dy ** 2) / this.distanceStep ** 2;
            if (distanceSquared == 0)
                return;
            const angle = Math.atan2(dy, dx);
            const force = coefficient / distanceSquared;
            this.force[0] += force * Math.cos(angle);
            this.force[1] += force * Math.sin(angle);
        };
        this.update = (dt) => {
            this.x += (this.vx / 2) * dt;
            this.y += (this.vy / 2) * dt;
            this.vx += (this.force[0] * dt) / this.mass;
            this.vy += (this.force[1] * dt) / this.mass;
            this.x += (this.vx / 2) * dt;
            this.y += (this.vy / 2) * dt;
            this.force = [0, 0];
        };
        this.handleCollision = (other) => {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distanceSquared = dx ** 2 + dy ** 2;
            if (distanceSquared == 0)
                return;
            if (distanceSquared <= (this.size + BUFFER_SIZE) ** 2) {
                const angle = Math.atan2(dy, dx);
                const overlap = this.size + BUFFER_SIZE - Math.sqrt(distanceSquared);
                this.x -= (overlap * Math.cos(angle)) / 2;
                this.y -= (overlap * Math.sin(angle)) / 2;
                other.x += (overlap * Math.cos(angle)) / 2;
                other.y += (overlap * Math.sin(angle)) / 2;
            }
        };
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
const arena = new Arena(0, 0, widthMain, heightMain, VISCOSITY, []);
const pointsArray = [];
const renderFunction = () => {
    ctx.clearRect(0, 0, widthMain, heightMain);
};
const main = () => {
    //Create Aerna.
    //Add particles
    //Call animation to update particles
    for (let i = 0; i < POINTS_COUNT; i++) {
        const pointNew = new Point(1, 1, Math.random() * widthMain, Math.random() * heightMain, 0, 0, 0, arena, DISTANCE_SCALE, INTERACTION_MATRIX);
        arena.addPoint(pointNew);
        pointsArray.push(pointNew);
    }
    renderFunction();
};
/*
//Testing
const f1 = new Arena(0, 0, 1000, 1000, VISCOSITY, []);
const p1 = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
const p2 = new Point(1, 1, 200, 600, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
p1.addForceInteractionOfParticle(p2);
console.log(p1.force);
*/
const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
};
// addEventListener("mousemove", (e) => {
//   // const p = new Point(1, 1, 200, 300, 0, 0, 0, f1, 300, INTERACTION_MATRIX);
//   // p.addForceInteractionOfParticle(
//   //   new Point(1, 1, e.offsetX, e.offsetY, 0, 0, 0, f1, 300, INTERACTION_MATRIX)
//   // );
//   // console.log(p.force, e.offsetX, e.offsetY);
// });
