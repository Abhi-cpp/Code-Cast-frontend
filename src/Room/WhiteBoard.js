import React, { useEffect, useRef, useState } from 'react';
import fabric from 'fabric';

const Whiteboard = ({ socket, roomid }) => {
    // create whiteboard using fabric.js
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    const [prevPos, setPrevPos] = useState({ offsetX: 0, offsetY: 0 });

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current);
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = lineWidth;
        setCanvas(canvas);
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = lineWidth;
        }
    }, [color, lineWidth]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = lineWidth;
        canvas.renderAll();
        setPrevPos({ offsetX, offsetY });
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        canvas.isDrawingMode = false;
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        const offSetData = { offsetX, offsetY };
        const positionData = {
            start: { x: prevPos.offsetX, y: prevPos.offsetY },
            stop: { x: offSetData.offsetX, y: offSetData.offsetY },
        };
        socket.emit('draw', { roomid, positionData, color, lineWidth });
        setPrevPos({ offsetX, offsetY });
    };

    const clearCanvas = () => {
        canvas.clear();
    };

    const handleColorChange = (e) => {
        setColor(e.target.value);
    };

    const handleLineWidthChange = (e) => {
        setLineWidth(e.target.value);
    };

    return (
        <div className="whiteboard">
            <div className="whiteboard__canvas">
                <canvas
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={canvasRef}
                />
            </div>
            <div className="whiteboard__controls">
                <div className="whiteboard__controls__color">
                    <label htmlFor="color">Color</label>
                    <input
                        type="color"
                        id="color"
                        value={color}
                        onChange={handleColorChange}
                    />
                </div>
                <div className="whiteboard__controls__lineWidth">
                    <label htmlFor="lineWidth">Line Width</label>
                    <input
                        type="range"
                        id="lineWidth"
                        min="1"
                        max="100"
                        value={lineWidth}
                        onChange={handleLineWidthChange}
                    />
                </div>
                <button onClick={clearCanvas}>Clear</button>
            </div>
        </div>
    );

};

export default Whiteboard;
