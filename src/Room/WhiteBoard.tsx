import { useContext, useEffect, useRef } from "react";
import "../Styles/whiteBoard.css";
import { DataContext } from "../Components/DataContext.tsx";
import { WhiteBoardDataT } from "../types/whiteBoard.ts";

const WhiteBoard = ({ currRoom }: { currRoom: any }) => {
  const { socket } = useContext(DataContext);
  const roomId = useRef(currRoom ? currRoom.roomid : "");
  const isWhiteBoardOpen = useRef(false);

  useEffect(() => {
    const root = document.querySelector("#root");
    const canvas = document.querySelector(
      " #white-board canvas",
    ) as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight - 80 - 50);
    let time = performance.now();

    let interval: NodeJS.Timer | number = 0;
    let colorInterval: NodeJS.Timer | number = 0;
    const triangle = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
    const rectangle = [0, 0, 0, 0];
    const circle = [0, 0, 0, 0, 0];

    const whiteBoard = document.querySelector("#white-board");
    const data: WhiteBoardDataT = {
      color: root?.classList.contains("dark") ? "white" : "black",
      thickness: 1,
      prevX: 0,
      prevY: 0,
      x: 0,
      y: 0,
    };
    const colors = document.querySelectorAll(
      ".colors .color",
    ) as NodeListOf<HTMLElement>;
    const sizes = document.querySelectorAll(
      ".sizes .size",
    ) as NodeListOf<HTMLElement>;
    const eraser = document.querySelector("#eraser") as HTMLElement;
    const shapes = document.querySelectorAll(
      ".shapes .shape",
    ) as NodeListOf<HTMLElement>;
    // click events

    colors.forEach((color, index) => {
      color.addEventListener("click", () => {
        clearInterval(colorInterval);
        colors.forEach((color) => color.classList.remove("active"));
        color.classList.add("active");
        sizes[data.thickness - 1].classList.add("active");
        eraser?.classList.remove("active");
        if (index == colors.length - 1) {
          changeContinuous();
        } else {
          data.color = getComputedStyle(color).getPropertyValue("--color");
          if (data.color == "black" && root?.classList.contains("dark")) {
            data.color = "white";
          }
          if (ctx) {
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.thickness;
          }
        }
        changeColorShape();
      });
    });

    sizes.forEach((size) => {
      size.addEventListener("click", () => {
        sizes.forEach((size) => size.classList.remove("active"));
        size.classList.add("active");
        eraser?.classList.remove("active");
        if (data.color == "white") {
          colors[0].classList.add("active");
        } else {
          colors.forEach((color) => {
            if (
              getComputedStyle(color).getPropertyValue("--color") == data.color
            ) {
              color.classList.add("active");
            }
          });
        }
        data.thickness = parseInt(
          getComputedStyle(size).getPropertyValue("--width"),
        );
        if (ctx) {
          ctx.lineWidth = data.thickness;
          ctx.strokeStyle = data.color;
        }
      });
    });

    function changeContinuous() {
      colorInterval = setInterval(() => {
        if (ctx)
          ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255,
          )}, ${Math.floor(Math.random() * 255)})`;
        if (ctx) data.color = ctx.strokeStyle;
      }, 300);
    }

    const clearScreenBtn = document.querySelector("#clearScreen");
    clearScreenBtn?.addEventListener("click", () => {
      ctx?.clearRect(0, 0, width, height);
    });

    eraser.addEventListener("click", () => {
      const newColor = (
        document.querySelector(".room") as HTMLElement
      )?.style.getPropertyValue("--primary-background-color");
      if (ctx) {
        ctx.strokeStyle = newColor;
        ctx.lineWidth = 20;
      }
      eraser.classList.add("active");
      sizes.forEach((size) => size.classList.remove("active"));
      colors.forEach((color) => color.classList.remove("active"));
      shapes.forEach((shape) => shape.classList.remove("active"));
      pen.classList.remove("active");
      clearInterval(colorInterval);
    });

    const pen = document.querySelector("#pen") as HTMLElement;

    pen.addEventListener("click", () => {
      if (ctx) {
        ctx.lineWidth = data.thickness;
        ctx.strokeStyle = data.color;
      }
      shapes.forEach((shape) => shape.classList.remove("active"));
      eraser.classList.remove("active");
      clearInterval(colorInterval);
      pen.classList.add("active");
      changeColorShape();
      sizes[data.thickness - 1].classList.add("active");
      if (data.color == "white") {
        colors[0].classList.add("active");
      } else {
        colors.forEach((color) => {
          if (
            getComputedStyle(color).getPropertyValue("--color") == data.color
          ) {
            color.classList.add("active");
          }
        });
      }
    });

    shapes.forEach((shape) => {
      shape.addEventListener("click", () => {
        shapes.forEach((shape) => shape.classList.remove("active"));
        pen.classList.remove("active");
        shape.classList.add("active");
        eraser.classList.remove("active");
        if (ctx) {
          ctx.lineWidth = data.thickness;
          ctx.strokeStyle = data.color;
        }
        sizes[data.thickness - 1].classList.add("active");
        if (data.color == "white") {
          colors[0].classList.add("active");
        } else {
          colors.forEach((color) => {
            if (
              getComputedStyle(color).getPropertyValue("--color") == data.color
            ) {
              color.classList.add("active");
            }
          });
        }
        clearInterval(colorInterval);
        changeColorShape();
      });
    });

    function changeColorShape() {
      const shapes = document.querySelectorAll(
        ".shapes .shape, .shapes #pen",
      ) as NodeListOf<HTMLElement>;
      shapes.forEach((shape) => {
        if (shape.classList.contains("active")) {
          shape.style.color = data.color + "";
          shape.style.borderColor = data.color + "";
        } else {
          shape.style.color = root?.classList.contains("dark")
            ? "white"
            : "black";
          shape.style.borderColor = root?.classList.contains("dark")
            ? "white"
            : "black";
        }
      });
    }

    function dragged(e) {
      if (performance.now() - time < 10) return;
      data.prevX = data.x;
      data.prevY = data.y;
      data.x = e.offsetX;
      data.y = e.offsetY;
      time = performance.now();
    }

    function pressed(e) {
      const shape = Array.from(shapes).find((shape) =>
        shape.classList.contains("active"),
      );

      if (shape) {
        triangle[0].x = e.offsetX;
        triangle[1].y = e.offsetY;
        rectangle[0] = e.offsetX;
        rectangle[1] = e.offsetY;
        circle[0] = e.offsetX;
        circle[1] = e.offsetY;

        canvas.addEventListener(
          "mouseup",
          (e2) => {
            drawShape(e2, shape);
            if (shape.id == "triangle") {
              drawTriangle();
            } else if (shape.id == "rectangle") {
              drawRectangle();
            } else {
              drawCircle();
            }
          },
          { once: true },
        );
      } else {
        data.prevX = data.x = e.offsetX;
        data.prevY = data.y = e.offsetY;
        canvas.addEventListener("mousemove", dragged);
        canvas.addEventListener("mouseup", lifted);
        interval = setInterval(() => drawLine(), 10);
      }
    }

    function lifted() {
      if (
        Array.from(shapes).some((shape) => shape.classList.contains("active"))
      )
        return;
      clearInterval(interval);
      canvas.removeEventListener("mousemove", dragged);
    }
    canvas.addEventListener("mousedown", pressed);

    function drawLine() {
      ctx?.beginPath();
      ctx?.moveTo(data.prevX, data.prevY);
      ctx?.lineTo(data.x, data.y);
      ctx?.stroke();
      socket.emit("drawData", {
        roomId: roomId.current,
        prevX: data.prevX,
        prevY: data.prevY,
        x: data.x,
        y: data.y,
        color: data.color,
        thickness: data.thickness,
        shape: eraser?.classList.contains("active") ? "eraser" : "pen",
      });
    }

    function drawShape(e, shape) {
      if (shape.id == "triangle") {
        triangle[0].y = e.offsetY;
        triangle[2].x = e.offsetX;
        triangle[2].y = e.offsetY;
        triangle[1].x = (triangle[0].x + triangle[2].x) / 2;
      }

      if (shape.id == "rectangle") {
        rectangle[2] = e.offsetX;
        rectangle[3] = e.offsetY;
      }

      if (shape.id == "circle") {
        circle[2] = (e.offsetX - circle[0]) / 2 + circle[0];
        circle[3] = (e.offsetY - circle[1]) / 2 + circle[1];
        circle[4] = Math.sqrt(
          Math.pow(e.offsetX - circle[2], 2) +
            Math.pow(e.offsetY - circle[3], 2),
        );
      }
    }

    function drawTriangle() {
      if (ctx) {
        ctx.fillStyle = data.color;
        ctx.lineWidth = data.thickness;
      }
      ctx?.beginPath();
      ctx?.moveTo(triangle[0].x, triangle[0].y);
      ctx?.lineTo(triangle[1].x, triangle[1].y);
      ctx?.lineTo(triangle[2].x, triangle[2].y);
      ctx?.lineTo(triangle[0].x, triangle[0].y);
      ctx?.stroke();
      socket.emit("drawData", {
        triangle,
        color: data.color,
        thickness: data.thickness,
        shape: "triangle",
      });
    }

    function drawRectangle() {
      if (ctx) {
        ctx.fillStyle = data.color;
        ctx.lineWidth = data.thickness;
      }
      ctx?.beginPath();
      ctx?.rect(
        rectangle[0],
        rectangle[1],
        rectangle[2] - rectangle[0],
        rectangle[3] - rectangle[1],
      );
      ctx?.stroke();
      socket.emit("drawData", {
        rectangle,
        color: data.color,
        thickness: data.thickness,
        shape: "rectangle",
      });
    }

    function drawCircle() {
      if (ctx) {
        ctx.fillStyle = data.color;
        ctx.lineWidth = data.thickness;
      }
      ctx?.beginPath();
      ctx?.arc(circle[2], circle[3], circle[4], 0, 2 * Math.PI);
      ctx?.stroke();
      socket.emit("drawData", {
        x: circle[2],
        y: circle[3],
        radius: circle[4],
        color: data.color,
        thickness: data.thickness,
        shape: "circle",
      });
    }

    socket.on("drawData", (data) => {
      if (ctx) {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.thickness;
      }
      if (data.shape === "triangle") {
        ctx?.beginPath();
        ctx?.moveTo(data.triangle[0].x, data.triangle[0].y);
        ctx?.lineTo(data.triangle[1].x, data.triangle[1].y);
        ctx?.lineTo(data.triangle[2].x, data.triangle[2].y);
        ctx?.lineTo(data.triangle[0].x, data.triangle[0].y);
        ctx?.stroke();
        return;
      }
      if (data.shape === "rectangle") {
        ctx?.beginPath();
        ctx?.rect(
          data.rectangle[0],
          data.rectangle[1],
          data.rectangle[2] - data.rectangle[0],
          data.rectangle[3] - data.rectangle[1],
        );
        ctx?.stroke();
        return;
      }
      if (data.shape === "circle") {
        ctx?.beginPath();
        ctx?.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
        ctx?.stroke();
        return;
      }
      if (data.shape === "eraser" && ctx) {
        ctx.lineWidth = 20;
        ctx.strokeStyle = "#fff";
      }
      ctx?.beginPath();
      ctx?.moveTo(data.prevX, data.prevY);
      ctx?.lineTo(data.x, data.y);
      ctx?.stroke();
    });

    const whiteBoardBtn = document.querySelector(
      ".change-component-btn .change-btn",
    );
    whiteBoardBtn?.addEventListener("click", () => {
      const coreComponentsParent = document.querySelector(".core-components");
      const topPosition = !isWhiteBoardOpen.current
        ? coreComponentsParent?.scrollHeight
        : 0;
      coreComponentsParent?.scrollTo({ top: topPosition, behavior: "smooth" });
      isWhiteBoardOpen.current = !isWhiteBoardOpen.current;
      whiteBoardBtn?.classList.toggle("whiteboard-open");
    });
  }, []);
  return (
    <div id="white-board">
      <div className="change-component-btn">
        <button className="change-btn">
          <p>WhiteBoard</p>
        </button>
      </div>
      <div className="toolbar">
        <div className="sizes">
          <div
            className="size active"
            style={{ "--width": 1 } as React.CSSProperties}
          ></div>
          <div
            className="size"
            style={{ "--width": 2 } as React.CSSProperties}
          ></div>
          <div
            className="size"
            style={{ "--width": 3 } as React.CSSProperties}
          ></div>
          <div
            className="size"
            style={{ "--width": 4 } as React.CSSProperties}
          ></div>
        </div>

        <div className="colors">
          <div
            className="color active"
            style={{ "--color": "white" } as React.CSSProperties}
          ></div>
          <div
            className="color"
            style={{ "--color": "blue" } as React.CSSProperties}
          ></div>
          <div
            className="color"
            style={{ "--color": "green" } as React.CSSProperties}
          ></div>
          <div
            className="color"
            style={{ "--color": "yellow" } as React.CSSProperties}
          ></div>
          <div
            className="color"
            style={{ "--color": "red" } as React.CSSProperties}
          ></div>
          <div
            className="color"
            style={
              {
                "--color":
                  "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 50%, rgba(0,255,0,1) 100%)",
              } as React.CSSProperties
            }
          ></div>
        </div>

        <div className="extras">
          <div id="eraser"></div>
          <div id="clearScreen">Clear</div>
          <div className="shapes">
            <div id="pen" className="active">
              <i className="fa-solid fa-pen"></i>
            </div>
            <div className="shape" id="circle">
              <i className="far fa-circle"></i>
            </div>
            <div className="shape" id="rectangle">
              <i className="fa-regular fa-square"></i>
            </div>
            <div
              className="shape"
              id="triangle"
              style={{ transform: "rotate(-90deg)" }}
            >
              <i className="fa-solid fa-play"></i>
            </div>
          </div>
        </div>
      </div>
      <canvas></canvas>
    </div>
  );
};

export default WhiteBoard;
