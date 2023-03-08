// const socket = io("https://whiteboard-server.onrender.com");
// socket.on("connect", () => {
//     console.log("connected");
// });
// socket.on("newData", ({ prevX, prevY, x, y, color, width }) => {
//     ctx.beginPath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = width;
//     ctx.moveTo(prevX, prevY)
//     ctx.lineTo(x, y);
//     ctx.stroke();
// });


const canvas = document.querySelector(' #white-board canvas');
const ctx = canvas.getContext('2d');
const cursor = document.querySelector('#cursor');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight - 80 - 50;
let time = performance.now();

let interval = 0;
let colorInterval = 0;
let prevX = 0;
let prevY = 0;
let x = 0;
let y = 0;
let elapsed = performance.now();
const triangle = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
const rectangle = [0, 0, 0, 0];
const circle = [0, 0, 0, 0, 0];



const data = { color: "#000", width: 1 };
const colors = document.querySelectorAll(".colors .color");
const sizes = document.querySelectorAll(".sizes .size");
const eraser = document.querySelector("#eraser");
const shapes = document.querySelectorAll(".shapes .shape");

// click events

colors.forEach((color, index) => {
    color.addEventListener("click", () => {
        clearInterval(colorInterval);
        colors.forEach(color => color.classList.remove("active"));
        color.classList.add("active");
        eraser.classList.remove("active");
        if (index == colors.length - 1) {
            changeContinuous();
        } else {
            data.color = getComputedStyle(color).getPropertyValue("--color");
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
        }
        changeColorShape();
    })
})

sizes.forEach(size => {
    size.addEventListener("click", () => {
        sizes.forEach(size => size.classList.remove("active"));
        size.classList.add("active");
        eraser.classList.remove("active");
        data.width = getComputedStyle(size).getPropertyValue("--width");
        ctx.lineWidth = data.width;
        ctx.strokeStyle = data.color;
    })
})

function changeContinuous() {
    colorInterval = setInterval(() => {
        ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        data.color = ctx.strokeStyle;
    }, 300);
}

const clearScreenBtn = document.querySelector("#clearScreen");
clearScreenBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, width, height);
});

eraser.addEventListener("click", () => {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 20;
    data.color = "#fff";
    data.width = 20;
    eraser.classList.add("active");
    sizes.forEach(size => size.classList.remove("active"));
    colors.forEach(color => color.classList.remove("active"));
    shapes.forEach(shape => shape.classList.remove("active"));
    pen.classList.remove("active")
    clearInterval(colorInterval);
})

const pen = document.querySelector("#pen");

pen.addEventListener("click", () => {
    shapes.forEach(shape => shape.classList.remove("active"));
    eraser.classList.remove("active");
    clearInterval(colorInterval);
    pen.classList.add("active")
    changeColorShape();
})

shapes.forEach(shape => {
    shape.addEventListener("click", () => {
        shapes.forEach(shape => shape.classList.remove("active"));
        pen.classList.remove("active");
        shape.classList.add("active");
        eraser.classList.remove("active");
        clearInterval(colorInterval);
        changeColorShape();
    })
})

function changeColorShape() {
    const shapes = document.querySelectorAll(".shapes .shape, .shapes #pen");
    shapes.forEach(shape => {
        if (shape.classList.contains("active")) {
            shape.style.color = data.color;
            shape.style.borderColor = data.color;
        } else {
            shape.style.color = "black";
            shape.style.borderColor = "black";
        }
    })
}



// event listeners

window.addEventListener('mousemove', (e) => {
    if (performance.now() - time < 10) return;
    prevX = x;
    prevY = y;
    x = e.offsetX;
    y = e.offsetY;
    time = performance.now();
})

canvas.addEventListener('mousedown', (e) => {
    const shape = Array.from(shapes).find(shape => shape.classList.contains("active"));
    if (shape) {
        triangle[0].x = e.offsetX;
        triangle[1].y = e.offsetY;
        rectangle[0] = e.offsetX;
        rectangle[1] = e.offsetY;
        circle[0] = e.offsetX;
        circle[1] = e.offsetY;

        canvas.addEventListener("mousemove", callDrawShape);

        function callDrawShape(e) {
            drawShape(e, shape);
        }

        canvas.addEventListener("mouseup", () => {
            canvas.removeEventListener("mousemove", callDrawShape);
            if (shape.id == "triangle") {
                drawTriangle()
            } else if (shape.id == "rectangle") {
                drawRectangle()
            } else {
                drawCircle();
            }
        }, { once: true })


        return;
    };
    interval = setInterval(() => drawLine(), 10);
})

canvas.addEventListener('mouseup', () => {
    if (Array.from(shapes).some(shape => shape.classList.contains("active"))) return;
    clearInterval(interval);
})

canvas.addEventListener("mouseleave", () => {
    clearInterval(interval);
})

function drawLine() {
    ctx.beginPath();
    ctx.strokeStyle = data.color;
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y);
    ctx.stroke();
}



let previousCircle = [...circle];


function drawShape(e, shape) {
    if (shape.id == "triangle") {
        triangle[0].y = e.offsetY;
        triangle[2].x = e.offsetX;
        triangle[2].y = e.offsetY;
        triangle[1].x = (triangle[0].x + triangle[2].x) / 2;
        drawTriangle();
    }

    if (shape.id == "rectangle") {
        rectangle[2] = e.offsetX;
        rectangle[3] = e.offsetY;
        ctx.clearRect(rectangle[0], rectangle[1], rectangle[2] - rectangle[0], rectangle[3] - rectangle[1]);
        drawRectangle();
    }

    if (shape.id == "circle") {
        ctx.beginPath();
        ctx.arc(previousCircle[2], previousCircle[3], previousCircle[4], 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        circle[2] = (e.offsetX - circle[0]) / 2 + circle[0];
        circle[3] = (e.offsetY - circle[1]) / 2 + circle[1];
        circle[4] = Math.sqrt(Math.pow(e.offsetX - circle[2], 2) + Math.pow(e.offsetY - circle[3], 2));
        drawCircle();
    }
}


function drawTriangle() {
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.lineTo(triangle[0].x, triangle[0].y);
    ctx.stroke();
}

function drawRectangle() {
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.rect(rectangle[0], rectangle[1], rectangle[2] - rectangle[0], rectangle[3] - rectangle[1]);
    ctx.stroke();
}

function drawCircle() {
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.arc(circle[2], circle[3], circle[4], 0, 2 * Math.PI);
    ctx.stroke();
    previousCircle = [...circle];
}







