import { useEffect } from "react";
import AppendScript from "../AppendScript";
import "../whiteBoard.css";

const WhiteBoard = () => {

    useEffect(() => {
        AppendScript('./whiteBoard.js');

        const whiteBoardBtn = document.querySelector("#white-board  button");
        whiteBoardBtn.addEventListener("click", () => {
            whiteBoardBtn.parentElement.classList.toggle("active");
        })
    }, []);
    return (
        <div id="white-board">
            <div className="toolbar">
                <div className="sizes">
                    <div className="size active" style={{ "--width": 1 }}></div>
                    <div className="size" style={{ "--width": 2 }}></div>
                    <div className="size" style={{ "--width": 3 }}></div>
                    <div className="size" style={{ "--width": 4 }}></div>
                </div>

                <div className="colors">
                    <div className="color active" style={{ "--color": "black" }}></div>
                    <div className="color" style={{ "--color": "blue" }}></div>
                    <div className="color" style={{ "--color": "green" }}></div>
                    <div className="color" style={{ "--color": "yellow" }}></div>
                    <div className="color" style={{ "--color": "red" }}></div>
                    <div
                        className="color"
                        style=
                        {{
                            "--color": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 50%, rgba(0,255,0,1) 100%)"
                        }}

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
                        <div className="shape" id="triangle" style={{ "transform": "rotate(-90deg)" }}>
                            <i className="fa-solid fa-play"></i>
                        </div>
                    </div>
                </div>

            </div>
            <canvas></canvas>
            <button id="white-board-btn"><span>WhiteBoard</span></button>

        </div >
    )
};

export default WhiteBoard;