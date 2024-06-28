"use strict";
const INTERACTION_MATRIX = [
    [1, 10],
    [-10, 5],
];
const FORCE_MULTIPLIER = 0.1;
const VISCOSITY = 1;
const TREE_CAPACITY = 4;
const DISTANCE_SCALE = 5;
const BUFFER_SIZE = 1;
const TIME_STEP = 0.01;
const POINTS_COUNT = 700;
const PARTICLE_SIZE = 5;
const SEARCH_RANGE_MULTIPLIER = 50;
const MAX_FORCE = 1;
const MAX_VELOCITY = 0.1;
const COLLISION_RANGE_MULTIPLIER = 3;
const MASS_OF_PARTICLES = 100;
class Arena {
    constructor(_x, _y, _width, _height, _viscosity, _objects = []) {
        this.addPoint = (point) => {
            this.objects.push(point);
            this.tree.addPoint(point);
        };
        this.updateForcesAndCollisionOfSingleParticle = (point) => {
            const x1 = point.x - SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE;
            const y1 = point.y - SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE;
            const x2 = point.x + SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE;
            const y2 = point.y + SEARCH_RANGE_MULTIPLIER * DISTANCE_SCALE;
            const pointsToCheckForForce = this.tree.queryTree(x1, y1, x2, y2);
            for (const other of pointsToCheckForForce) {
                point.addForceInteractionOfParticle(other);
            }
        };
        this.updateAll = (dt) => {
            this.tree = new QuadTree(0, 0, Math.max(this.width, this.height), Math.max(this.width, this.height), TREE_CAPACITY);
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
                const pointsToCheckForCollision = this.tree.queryTree(point.x - 2 * point.size, point.y - 2 * point.size, point.x + 2 * point.size, point.y + 2 * point.size);
                pointsToCheckForCollision.forEach((other) => {
                    point.handleCollision(other);
                });
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
            let dx = other.x - this.x;
            const dxVals = [dx - widthMain, dx, dx + widthMain];
            dx = dxVals.reduce((min, current) => Math.abs(current) < Math.abs(min) ? current : min);
            // const dx = Math.max(other.x - this.x, );
            let dy = other.y - this.y;
            const dyVals = [dy - widthMain, dy, dy + widthMain];
            dy = dyVals.reduce((min, current) => Math.abs(current) < Math.abs(min) ? current : min);
            const distanceSquared = (dx ** 2 + dy ** 2) / this.distanceStep ** 2;
            if (distanceSquared == 0)
                return;
            const angle = Math.atan2(dy, dx);
            let force = coefficient / distanceSquared;
            force = force > MAX_FORCE ? MAX_FORCE : force;
            this.force[0] += force * Math.cos(angle);
            this.force[1] += force * Math.sin(angle);
            this.force[0] = this.force[0] > MAX_FORCE ? MAX_FORCE : this.force[0];
            this.force[1] = this.force[1] > MAX_FORCE ? MAX_FORCE : this.force[1];
        };
        this.update = (dt) => {
            this.force[0] -= this.vx * VISCOSITY;
            this.force[1] -= this.vy * VISCOSITY;
            this.vx += (this.force[0] * dt) / this.mass;
            this.vy += (this.force[1] * dt) / this.mass;
            if (this.vx ** 2 + this.vy ** 2 > MAX_VELOCITY ** 2) {
                const angle = Math.atan2(this.vy, this.vx);
                this.vx = MAX_VELOCITY * Math.cos(angle);
                this.vy = MAX_VELOCITY * Math.sin(angle);
            }
            // if (this.vx > MAX_VELOCITY) {
            //   this.vx = MAX_VELOCITY;
            // }
            // if (this.vy > MAX_VELOCITY) {
            //   this.vy = MAX_VELOCITY;
            // }
            // if (this.vx < -MAX_VELOCITY) {
            //   this.vx = -MAX_VELOCITY;
            // }
            // if (this.vy < -MAX_VELOCITY) {
            //   this.vy = -MAX_VELOCITY;
            // }
            // this.x += (this.vx / 2) * dt;
            // this.y += (this.vy / 2) * dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            if (this.x > widthMain) {
                this.x = 0;
                // this.vx *= -1;
            }
            if (this.x < 0) {
                this.x = widthMain - 1;
                // this.vx *= -1;
            }
            if (this.y > heightMain) {
                this.y = 0;
                // this.vy *= -1;
            }
            if (this.y < 0) {
                this.y = heightMain - 1;
                // this.vy *= -1;
            }
            // this.x = this.x<0?0:this.x;
            // this.y = this.y<0?0:this.y;
            // this.x = this.x>(widthMain-1)?(widthMain-1):this.x
            // this.y = this.y>(heightMain-1)?(heightMain-1):this.y
            this.force = [0, 0];
        };
        this.handleCollision = (other) => {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distanceSquared = dx ** 2 + dy ** 2;
            if (distanceSquared == 0)
                return;
            if (distanceSquared <= (this.size + other.size + 2) ** 2) {
                const angle = Math.atan2(dy, dx);
                const overlap = 2 * this.size - Math.sqrt(distanceSquared) + BUFFER_SIZE;
                this.x -= 0.5 * (overlap * Math.cos(angle));
                this.y -= 0.5 * (overlap * Math.sin(angle));
                other.x += 0.5 * (overlap * Math.cos(angle));
                other.y += 0.5 * (overlap * Math.sin(angle));
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
const drawTree = (tree) => {
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
const mainLoop = () => {
    const newTime = performance.now();
    arena.updateAll((newTime - timeNow) / 2);
    timeNow = newTime;
    renderFunction();
    requestAnimationFrame(mainLoop);
};
const setup = () => {
    //Create Aerna.
    //Add particles
    //Call animation to update particles
    for (let i = 0; i < POINTS_COUNT; i++) {
        const pointNew = new Point(MASS_OF_PARTICLES, PARTICLE_SIZE, Math.random() * widthMain, Math.random() * heightMain, 0, 0, Math.round(Math.random()), arena, DISTANCE_SCALE, INTERACTION_MATRIX);
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
const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
};
