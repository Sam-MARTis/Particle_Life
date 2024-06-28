const LEAF_NODE_MAX_CAPACITY = 4;


class QuadTree {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  capacity: number;
  divided: boolean;
  subTrees: QuadTree[];
  pointsCount: number;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    capacity: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pointsCount = 0;
    this.points = [];
    this.capacity = capacity;
    this.divided = false;
    this.subTrees = [];
  }

  checkValidPoint = (point: Point): boolean => {
    return (
      point.x > this.x &&
      point.x <= this.x + this.width &&
      point.y > this.y &&
      point.y <= this.y + this.height
    );
  };
  subDivide = (): void => {
    this.divided = true;
    this.subTrees.push(
      new QuadTree(
        this.x,
        this.y,
        this.width / 2,
        this.height / 2,
        this.capacity
      )
    );
    this.subTrees.push(
      new QuadTree(
        this.x + this.width / 2,
        this.y,
        this.width / 2,
        this.height / 2,
        this.capacity
      )
    );
    this.subTrees.push(
      new QuadTree(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        this.capacity
      )
    );
    this.subTrees.push(
      new QuadTree(
        this.x,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        this.capacity
      )
    );
    this.points.forEach((point) => {
      this.subTrees.forEach((tree) => {
        tree.addPoint(point);
      });
    });
    this.points = [];
  };

  addPoint = (point: Point): boolean => {
    if (this.checkValidPoint(point) == false) {
      return false;
    }
    this.pointsCount += 1;

    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);

      return true;
    } else {
      if (!this.divided) {
        this.points.push(point);
        this.subDivide();
        return true;
      } else {
        for (let i = 0; i < this.subTrees.length; i++) {
          if (this.subTrees[i].addPoint(point)) {
            return true;
          }
        }
      }
      console.warn(point.x, point.y)
      throw new Error("Point not in sub trees");
    }
  };
  addPoints = (pointList: Point[]): void => {
    pointList.forEach(point => {
      this.addPoint(point)
    })
  }

  doesIntersect = (
    rx1: number,
    ry1: number,
    rx2: number,
    ry2: number
  ): boolean => {
    let x1 = this.x;
    let x2 = this.x + this.width;
    let y1 = this.y;
    let y2 = this.y + this.height;
    return x2 > rx1 && x1 <= rx2 && y1 < ry2 && y2 >= ry1;
  };

  queryTree = (rx1: number, ry1: number, rx2: number, ry2: number): Point[] => {
    //In case of errors, try adding -1 to width and height
    // if(rx1<this.x){
    //   return [...this.queryTree(this.x, ry1, rx2, ry2), ...this.queryTree(rx1+(this.width-1), ry1, this.x+(this.width-1), ry2)]
    // }
    // if(ry1<this.y){
    //   return [...this.queryTree(rx1, this.y, rx2, ry2), ...this.queryTree(rx1, ry1+(this.height-1), rx2, this.y+(this.height-1))]
    // } if(rx2>this.x+(this.width-1)){
    //   return [...this.queryTree(rx1, ry1, this.x+(this.width-1), ry2), ...this.queryTree(this.x, ry1, rx2-(this.width-1), ry2)]
    // }if(ry2>this.y+(this.height-1)){
    //   return [...this.queryTree(rx1, ry1, rx2, this.y+(this.height-1)), ...this.queryTree(rx1, this.y, rx2, ry2-(this.height-1))]
    // }
    // else{
    //  if(rx1<this.x){
    //   return this.queryTree(this.x, ry1, rx2, ry2).concat(this.queryTree(rx1+(this.width-1), ry1, this.x+(this.width-1), ry2))
    // }
    // if(ry1<this.y){
    //   return this.queryTree(rx1, this.y, rx2, ry2).concat(this.queryTree(rx1, ry1+(this.height-1), rx2, this.y+(this.height-1)))
    // } if(rx2>this.x+(this.width-1)){
    //   return this.queryTree(rx1, ry1, this.x+(this.width-1), ry2).concat(this.queryTree(this.x, ry1, rx2-(this.width-1), ry2))
    // }if(ry2>this.y+(this.height-1)){
    //   return this.queryTree(rx1, ry1, rx2, this.y+(this.height-1)).concat(this.queryTree(rx1, this.y, rx2, ry2-(this.height-1)))
    // }
    // else{

    if (!this.doesIntersect(rx1, ry1, rx2, ry2)) {
      return [];
    }
    let pointsToReturn: Point[] = [];
    if (!this.divided) {
      this.points.forEach((point) => {
        if (point.x >= rx1 && point.x <= rx2 && point.y >= ry1 && point.y <= ry2) {
          pointsToReturn.push(point);
        }
      });
      return pointsToReturn;
    }
    this.subTrees.forEach((subtree) => {
      pointsToReturn.push(...subtree.queryTree(rx1, ry1, rx2, ry2));
    });

    return pointsToReturn;
  // }
  };
}

// let canvas: HTMLCanvasElement = document.getElementById(
//   "QuadTreesCanvas"
// ) as HTMLCanvasElement;
// let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
// let highlightRect: [number, number, number, number] = [0, 0, 0, 0];
// let pointsToHighlight: Point[] = [];

// const resizeCanvas = () => {
//   canvas.width = window.innerWidth * devicePixelRatio;
//   canvas.height = window.innerHeight * devicePixelRatio;
//   canvas.style.width = window.innerWidth + "px";
//   canvas.style.height = window.innerHeight + "px";
// };

// resizeCanvas();

// const myTree: QuadTree = new QuadTree(
//   0,
//   0,
//   Math.max(canvas.width, canvas.height),
//   Math.max(canvas.width, canvas.height),
//   LEAF_NODE_MAX_CAPACITY
// );
// const points: Point[] = [];

// const drawTree = (tree: QuadTree): void => {
//   ctx.beginPath();
//   ctx.strokeStyle = "white";
//   ctx.rect(tree.x, tree.y, tree.width, tree.height);
//   ctx.stroke();

//   if (tree.divided) {
//     tree.subTrees.forEach((subTree) => {
//       drawTree(subTree);
//     });
//   }
// };

// const renderStuff = () => {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawTree(myTree);
//   ctx.beginPath();
//   ctx.strokeStyle = "green";
//   ctx.lineWidth = 1;
//   ctx.rect(...highlightRect);
//   ctx.stroke();
//   ctx.closePath();
//   ctx.lineWidth = 0.4;
//   points.forEach((pointCurrent) => {
//     ctx.strokeStyle = pointCurrent.fillStyle;
//     ctx.fillStyle = pointCurrent.fillStyle;
//     ctx.beginPath();
//     ctx.arc(pointCurrent.x, pointCurrent.y, 2, 0, 2 * 3.1416);
//     ctx.fill();
//   });
// };

// const startTime = performance.now();

// const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
//   const rect = canvas.getBoundingClientRect();
//   const scaleX = canvas.width / rect.width;
//   const scaleY = canvas.height / rect.height;

//   return {
//     x: (event.clientX - rect.left) * scaleX,
//     y: (event.clientY - rect.top) * scaleY,
//   };
// };

// canvas.addEventListener("mousemove", (event) => {
//   if ((performance.now() - startTime) / 1000 < 4) {
//     const { x, y } = getMousePos(canvas, event);
//     const point = new Point(x, y);
//     points.push(point);
//     myTree.addPoint(point);
//   }
//   renderStuff();
// });

// canvas.addEventListener("click", (event) => {
//   pointsToHighlight = [];
//   const width = 200;
//   const height = 100;
//   const { x, y } = getMousePos(canvas, event);
//   const rectX = x - width / 2;
//   const rectY = y - height / 2;

//   highlightRect = [rectX, rectY, width, height];
//   pointsToHighlight = myTree.queryTree(
//     rectX,
//     rectY,
//     rectX + width,
//     rectY + height
//   );
//   pointsToHighlight.forEach((point) => {
//     point.fillStyle = "green";
//   });

//   renderStuff();
// });

// window.addEventListener("resize", () => {
//   resizeCanvas();
//   renderStuff();
// });
